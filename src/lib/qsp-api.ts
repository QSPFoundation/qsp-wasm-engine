import {
  QspAPI,
  QspVariableItem,
  QspVariableKey,
  QspVariableType,
  QspVariableValue,
} from '../contracts/api';
import { QspPanel, QspListItem } from '../contracts/common';
import { QspEventKeys, QspEventListeners, QspEvents, QspEventLogger } from '../contracts/events';
import {
  CharsPtr,
  IntPtr,
  Ptr,
  QspExportName,
  QspTuple,
  QspWasmHost,
  QspWasmModule,
  QspWindow,
  StringPtr,
  VariantPtr,
} from '../qsplib/public/qsp-wasm-module';
import {
  allocListBuffer,
  allocPointer,
  freeListBuffer,
  freePointer,
  ListBuffer,
  POINTER_SIZE,
  readInt,
  readListItems,
  readString,
  readVariant,
  withCharsRead,
  withBufferRead,
  withBufferWrite,
  withErrorRead,
  withLinesRead,
  withListRead,
  withObjectRead,
  withStringListRead,
  withStringWrite,
  withVariantWrite,
  writeString,
} from '../qsplib/public/qsp-wasm-memory';

type TypePrefix = '$' | '#' | '%';

const MAX_STRING_RESULT_LENGTH = 32 * 1024; // 64 KB

export class QspAPIImpl implements QspAPI {
  private listeners = new Map<QspEventKeys, QspEventListeners[]>();
  private variableWatchers = new Set<() => void>();
  // Values read with useCache, cleared whenever the engine may have run code (exec, notify, reset)
  private variableValues = new Map<string, QspVariableValue>();
  private eventLogger: QspEventLogger | null = null;

  private time: number = Date.now();

  // Upper-cased names passed to the engine
  private staticStrings: Map<string, CharsPtr> = new Map();

  // Output slots of the calls that only read the state (nothing can re-enter while a slot is used),
  // the calls that execute code allocate their outputs per call
  private slots: Ptr;
  private lists: ListBuffer;
  private valueSlot: VariantPtr;
  private keySlot: VariantPtr;
  private stringSlot: StringPtr;
  private intSlot: IntPtr;

  constructor(private module: QspWasmModule) {
    this.slots = this.module._malloc(POINTER_SIZE * 9);
    this.lists = allocListBuffer(this.module);
    this.valueSlot = this.slots as number as VariantPtr;
    this.keySlot = (this.slots + POINTER_SIZE * 3) as number as VariantPtr;
    this.stringSlot = (this.slots + POINTER_SIZE * 6) as number as StringPtr;
    this.intSlot = (this.slots + POINTER_SIZE * 8) as number as IntPtr;
    this.module.qspHost = this.createHost();
    this.module._QSPInit();
  }

  on<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
  }

  off<E extends keyof QspEvents>(event: E, listener: QspEvents[E]): void {
    let list = this.listeners.get(event) ?? [];
    list = list.filter((l) => l !== listener);
    if (list.length) {
      this.listeners.set(event, list);
    } else {
      this.listeners.delete(event);
    }
  }

  registerEventLogger(logger: QspEventLogger): void {
    this.eventLogger = logger;
  }

  watchVariable<Name extends string>(
    name: Name,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void {
    return this.watch(() => this.readVariable(name, true), callback);
  }

  watchVariableByIndex<Name extends string>(
    name: Name,
    index: number,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void {
    return this.watch(() => this.readVariableByIndex(name, index, true), callback);
  }

  watchVariableByKey<Name extends string>(
    name: Name,
    key: QspVariableKey,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void {
    return this.watch(() => this.readVariableByKey(name, key, true), callback);
  }

  private watch<T>(read: () => T, callback: (value: T) => void): () => void {
    let value = read();
    callback(value);
    const updater = () => {
      const newValue = read();
      if (value !== newValue) {
        value = newValue;
        callback(value);
      }
    };
    this.variableWatchers.add(updater);
    return () => {
      this.variableWatchers.delete(updater);
    };
  }

  private emit<E extends keyof QspEvents, CB extends QspEvents[E] = QspEvents[E]>(
    event: E,
    ...args: Parameters<CB>
  ): void {
    this.notify(event, ...args);
  }

  // Returns the results of the listeners
  private notify<E extends keyof QspEvents, CB extends QspEvents[E] = QspEvents[E]>(
    event: E,
    ...args: Parameters<CB>
  ): unknown[] {
    this.clearCache(); // the engine may have run code
    if (this.eventLogger) {
      this.eventLogger.log(event, ...args);
    }
    const list = this.listeners.get(event) ?? [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return list.map((listener) => listener(...args));
  }

  openGame(data: ArrayBuffer, isNewGame: boolean): Promise<void> {
    if (isNewGame) this.reset();
    return withBufferWrite(this.module, data, async (ptr, size) => {
      await this.run('QSPLoadGameWorldFromData', [ptr, size, isNewGame ? 1 : 0]);
    });
  }

  async saveGame(): Promise<ArrayBuffer | null> {
    const data = await withBufferRead(this.module, (buffer, size) =>
      this.exec('QSPSaveGameAsData', [buffer, size, 0]),
    );
    if (!data) this.onError();
    return data;
  }

  loadSave(data: ArrayBuffer): Promise<void> {
    return withBufferWrite(this.module, data, async (ptr, size) => {
      await this.run('QSPOpenSavedGameFromData', [ptr, size, 1]);
    });
  }

  async restartGame(): Promise<void> {
    this.time = Date.now();
    await this.run('QSPRestartGame', [1]);
  }

  async selectAction(index: number): Promise<void> {
    await this.run('QSPSetSelActionIndex', [index, 1]);
  }

  async execSelectedAction(): Promise<void> {
    await this.run('QSPExecuteSelActionCode', [1]);
  }

  async selectObject(index: number): Promise<void> {
    await this.run('QSPSetSelObjectIndex', [index, 1]);
  }

  version(): string {
    this.module._QSPGetVersion(this.stringSlot);
    return readString(this.module, this.stringSlot);
  }

  getStaticStringPointer(name: string): CharsPtr {
    let namePtr = this.staticStrings.get(name);
    if (!namePtr) {
      namePtr = writeString(this.module, name.toUpperCase());
      this.staticStrings.set(name, namePtr);
    }
    return namePtr;
  }

  readVariable<Name extends string>(name: Name, useCache = false): QspVariableType<Name> {
    return this.readVariableByIndex(name, 0, useCache);
  }

  readVariableByIndex<Name extends string>(
    name: Name,
    index: number,
    useCache = false,
  ): QspVariableType<Name> {
    if (useCache) return this.readCached(`${name}[${index}]`, () => this.readValue(name, index));
    return this.readValue(name, index);
  }

  readVariableByKey<Name extends string>(
    name: Name,
    key: QspVariableKey,
    useCache = false,
  ): QspVariableType<Name> {
    if (useCache) {
      return this.readCached(`${name}[${JSON.stringify(key)}]`, () =>
        this.readValue(name, this.readVariableIndexByKey(name, key)),
      );
    }
    return this.readValue(name, this.readVariableIndexByKey(name, key));
  }

  private readValue<Name extends string>(name: Name, index: number): QspVariableType<Name> {
    this.module._QSPGetVarValue(this.getStaticStringPointer(name), index, this.valueSlot, 0);
    return this.applyTypePrefix(name, readVariant(this.module, this.valueSlot));
  }

  private readCached<T extends QspVariableValue>(cacheKey: string, read: () => T): T {
    if (this.variableValues.has(cacheKey)) return this.variableValues.get(cacheKey) as T;
    const value = read();
    this.variableValues.set(cacheKey, value);
    return value;
  }

  readVariableIndexByKey(name: string, key: QspVariableKey): number {
    const namePtr = this.getStaticStringPointer(name);
    withVariantWrite(this.module, key, (keyPtr) =>
      this.module._QSPGetVarIndexByKey(namePtr, keyPtr, this.intSlot),
    );
    return readInt(this.module, this.intSlot);
  }

  readVariableItem<Name extends string>(name: Name, index: number): QspVariableItem<Name> {
    const namePtr = this.getStaticStringPointer(name);
    this.module._QSPGetVarValue(namePtr, index, this.valueSlot, this.keySlot);
    return {
      value: this.applyTypePrefix(name, readVariant(this.module, this.valueSlot)),
      key: readVariant(this.module, this.keySlot),
    } as QspVariableItem<Name>;
  }

  readVariableSize(name: string): number {
    this.module._QSPGetVarValuesCount(this.getStaticStringPointer(name), this.intSlot);
    return readInt(this.module, this.intSlot);
  }

  execCode(code: string, isRefresh = true): Promise<void> {
    return withStringWrite(this.module, code, async (ptr) => {
      await this.run('QSPExecString', [ptr, isRefresh ? 1 : 0]);
    });
  }

  async execCounter(): Promise<void> {
    await this.run('QSPExecCounter', [1]);
  }

  execLoc(name: string): Promise<void> {
    return withStringWrite(this.module, name, async (ptr) => {
      await this.run('QSPExecLocationCode', [ptr, 1]);
    });
  }

  updateUserInput(code: string): Promise<void> {
    return withStringWrite(this.module, code, async (ptr) => {
      await this.run('QSPExecUserInput', [ptr, 1]);
    });
  }

  enableDebugMode(): void {
    this.module._QSPEnableDebugMode(1);
  }
  disableDebugMode(): void {
    this.module._QSPEnableDebugMode(0);
  }

  getLocationsList(): string[] {
    return withStringListRead(this.module, this.lists, (items, bufSize) =>
      this.module._QSPGetLocationNames(items as number as StringPtr, bufSize),
    );
  }

  getLocationActions(name: string): QspListItem[] {
    const namePtr = this.getStaticStringPointer(name);
    return withListRead(this.module, this.lists, (items, bufSize) =>
      this.module._QSPGetLocationActions(namePtr, items, bufSize),
    );
  }

  getLocationCode(name: string): string[] {
    const namePtr = this.getStaticStringPointer(name);
    return withLinesRead(this.module, this.lists, (lines, bufSize) =>
      this.module._QSPGetLocationCode(namePtr, lines, bufSize),
    );
  }

  getActionCode(location: string, index: number): string[] {
    const namePtr = this.getStaticStringPointer(location);
    return withLinesRead(this.module, this.lists, (lines, bufSize) =>
      this.module._QSPGetLocationActionCode(namePtr, index, lines, bufSize),
    );
  }

  // The result is cut to MAX_STRING_RESULT_LENGTH characters
  calculateStringExpression(expression: string): Promise<string> {
    return withStringWrite(this.module, expression, (exprPtr) =>
      withCharsRead(this.module, MAX_STRING_RESULT_LENGTH, (buffer, size) =>
        this.run('QSPCalculateStrExpression', [exprPtr, buffer, size, 1]),
      ),
    );
  }

  async calculateNumericExpression(expression: string): Promise<number | null> {
    const resPtr = allocPointer(this.module);
    const success = await withStringWrite(this.module, expression, (exprPtr) =>
      this.run('QSPCalculateNumExpression', [exprPtr, resPtr, 1]),
    );
    const result = success ? readInt(this.module, resPtr) : null;
    freePointer(this.module, resPtr);
    return result;
  }

  showWindow(type: number, show: boolean): void {
    this.module._QSPShowWindow(type, show ? 1 : 0);
  }

  getSelectedActionIndex(): number {
    return this.module._QSPGetSelActionIndex();
  }

  getSelectedObjectIndex(): number {
    return this.module._QSPGetSelObjectIndex();
  }

  getCompiledDateTime(): string {
    this.module._QSPGetCompiledDateTime(this.stringSlot);
    return readString(this.module, this.stringSlot);
  }

  getErrorDescription(errorNum: number): string {
    this.module._QSPGetErrorDesc(errorNum, this.stringSlot);
    return readString(this.module, this.stringSlot);
  }

  getLocationDescription(name: string): string {
    this.module._QSPGetLocationDesc(this.getStaticStringPointer(name), this.stringSlot);
    return readString(this.module, this.stringSlot);
  }

  // Blocking events: the engine waits until a listener calls resolve, without a listener
  // it gets the default answer at once
  private ask<T>(
    event: QspEventKeys,
    emit: (resolve: (value: T) => void) => void,
  ): Promise<T> | undefined {
    return this.listeners.has(event) ? new Promise<T>(emit) : undefined;
  }

  // A promise returned to the engine suspends it until the promise settles
  private createHost(): QspWasmHost {
    return {
      onRefreshInt: (isForced, isNewLoc) => this.onRefresh(isForced, isNewLoc),
      onShowWindow: (type, isShown) =>
        this.emit('panel_visibility', type as number as QspPanel, isShown),
      onShowMenu: (items, count) =>
        this.ask<number>('menu', (resolve) =>
          this.emit('menu', readListItems(this.module, items, count), resolve),
        ) ?? -1,
      onShowMessage: (text) => this.ask<void>('msg', (resolve) => this.emit('msg', text, resolve)),
      onInputBox: (text) =>
        this.ask<string>('input', (resolve) => this.emit('input', text, resolve)) ?? '',
      onVersion: (param) =>
        this.ask<string>('version', (resolve) => this.emit('version', param, resolve)) ?? '',
      onSleep: (ms) => this.ask<void>('wait', (resolve) => this.emit('wait', ms, resolve)),
      onSetTimer: (ms) => this.emit('timer', ms),
      onSetInputStrText: (text) => this.emit('user_input', text),
      onShowPicture: (path) => this.emit('view', path),
      onDebug: (code) => this.onDebug(code),
      onSystem: (cmd) => {
        this.onRefresh(false, false);
        return waitForAll(this.notify('system_cmd', cmd));
      },
      onInitGame: (isNewGame) => waitForAll(this.notify('init_game', isNewGame)),
      onGetMSCount: () => {
        const elapsed = Date.now() - this.time;
        this.time = Date.now();
        return elapsed;
      },
      onOpenGame: (path, isNewGame) =>
        this.ask<void>('open_game', (resolve) => this.emit('open_game', path, isNewGame, resolve)),
      onOpenGameStatus: (path) =>
        this.ask<void>('load_save', (resolve) => this.emit('load_save', path, resolve)),
      onSaveGameStatus: (path) =>
        this.ask<void>('save_game', (resolve) => this.emit('save_game', path, resolve)),
      onIsPlayingFile: (file) =>
        this.ask<boolean>('is_play', (resolve) => this.emit('is_play', file, resolve)) ?? false,
      onPlayFile: (file, volume) =>
        this.ask<void>('play_file', (resolve) => this.emit('play_file', file, volume, resolve)),
      onCloseFile: (file) =>
        this.ask<void>('close_file', (resolve) => this.emit('close_file', file, resolve)),
    };
  }

  private onRefresh(isForced: boolean, isNewLoc: boolean): void {
    const changedState = this.module._QSPGetWindowsChangedState();

    if (isForced || (changedState & QspWindow.MAIN) !== 0) {
      this.module._QSPGetMainDesc(this.stringSlot);
      this.emit('main_changed', readString(this.module, this.stringSlot), isNewLoc);
    }

    if (isForced || (changedState & QspWindow.VARS) !== 0) {
      this.module._QSPGetVarsDesc(this.stringSlot);
      this.emit('stats_changed', readString(this.module, this.stringSlot));
    }

    if (isForced || (changedState & QspWindow.ACTS) !== 0) {
      const actions = withListRead(this.module, this.lists, (items, bufSize) =>
        this.module._QSPGetActions(items, bufSize),
      );
      this.emit('actions_changed', actions);
    }

    if (isForced || (changedState & QspWindow.OBJS) !== 0) {
      const objects = withObjectRead(this.module, this.lists, (items, bufSize) =>
        this.module._QSPGetObjects(items, bufSize),
      );
      this.emit('objects_changed', objects);
    }
    setTimeout(() => this.reportWatched(), 0);
  }

  private onDebug(code: string): Promise<void> | undefined {
    if (!this.listeners.has('debug')) return undefined;
    // the key slot holds the two ints of the state here
    const actIndexPtr = this.keySlot as number as IntPtr;
    const linePtr = (actIndexPtr + POINTER_SIZE) as number as IntPtr;
    this.module._QSPGetCurStateData(this.stringSlot, actIndexPtr, linePtr);
    const loc = readString(this.module, this.stringSlot);
    const line = readInt(this.module, linePtr);
    const actIndex = readInt(this.module, actIndexPtr);
    return new Promise((resolve) => this.emit('debug', { code, loc, line, actIndex }, resolve));
  }

  // Runs an export that executes game code, resolves when the engine finishes it
  // (a host promise can delay that, see qsp-wasm-host.js)
  private async exec(name: QspExportName, args: number[]): Promise<number> {
    const types = args.map(() => 'number' as const);
    this.clearCache();
    const result = await this.module.ccall(name, 'number', types, args, { async: true });
    this.clearCache();
    return result;
  }

  // Reports the error of a failed call
  private async run(name: QspExportName, args: number[]): Promise<number> {
    const result = await this.exec(name, args);
    if (!result) this.onError();
    return result;
  }

  private onError(): void {
    const error = withErrorRead(this.module, (ptr) => this.module._QSPGetLastErrorData(ptr));
    if (error.errorCode > 0) this.emit('error', error);
  }

  // $name / #name / %name: the empty value of that type if the stored type differs
  private applyTypePrefix<Name extends string>(
    name: Name,
    value: QspVariableValue,
  ): QspVariableType<Name> {
    const requested = getTypePrefix(name);
    if (requested && requested !== getValueTypePrefix(value)) {
      return getEmptyValue(requested) as QspVariableType<Name>;
    }
    return value as QspVariableType<Name>;
  }

  _run_checks() {
    this.module._QSPRunChecks();
  }

  clearCache(): void {
    this.variableValues.clear();
  }

  // Forgets the state of the current game
  private reset(): void {
    this.clearCache();
    this.variableWatchers.clear();
    for (const ptr of this.staticStrings.values()) {
      this.module._free(ptr);
    }
    this.staticStrings.clear();
  }

  // Terminates the engine and frees the memory of the API
  dispose(): void {
    if (!this.slots) return;
    this.reset();
    this.module._QSPTerminate();
    freeListBuffer(this.module, this.lists);
    this.module._free(this.slots);
    this.slots = 0 as number as Ptr;
  }

  private reportWatched() {
    for (const updater of this.variableWatchers.values()) {
      updater();
    }
  }

  toJSON(): string {
    return '[QSP API]';
  }
}

function isPromise(value: unknown): value is Promise<unknown> {
  return typeof (value as { then?: unknown } | undefined)?.then === 'function';
}

// The engine waits for the promises the listeners returned, if there are any
function waitForAll(results: unknown[]): Promise<void> | undefined {
  const pending = results.filter(isPromise);
  return pending.length ? Promise.all(pending).then(() => undefined) : undefined;
}

function getTypePrefix(name: string): TypePrefix | undefined {
  const prefix = name.charAt(0);
  return prefix === '$' || prefix === '#' || prefix === '%' ? prefix : undefined;
}

function getValueTypePrefix(value: QspVariableValue): TypePrefix | undefined {
  switch (typeof value) {
    case 'string':
      return '$';
    case 'number':
      return '#';
  }
  return Array.isArray(value) ? '%' : undefined;
}

function getEmptyValue(prefix: TypePrefix): string | number | QspTuple {
  return prefix === '$' ? '' : prefix === '#' ? 0 : [];
}
