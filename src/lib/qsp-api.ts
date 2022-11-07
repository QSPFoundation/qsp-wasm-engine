import { QspAPI, QspVaribleType } from '../contracts/api';
import { QspErrorData, QspPanel } from '../contracts/common';
import { QspEventKeys, QspEventListeners, QspEvents } from '../contracts/events';
import { Ptr, QspCallType, QspWasmModule, StringPtr } from '../contracts/wasm-module';
import {
  asAsync,
  readListItems,
  readString,
  withBufferRead,
  withBufferWrite,
  withListRead,
  withStringRead,
  withStringWrite,
  writeString,
  writeUTF32String,
} from './pointers';

export class QspAPIImpl implements QspAPI {
  private listeners = new Map<QspEventKeys, QspEventListeners[]>();
  private variableWatchers = new Set<() => void>();
  private variableValues = new Map<string, string | number>();

  private time: number = Date.now();

  private staticStrings: Map<string, Ptr> = new Map();

  constructor(private module: QspWasmModule) {
    this.init();
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

  watchVariable<Name extends string>(
    name: Name,
    index: number,
    callback: (value: QspVaribleType<Name>) => void
  ): () => void {
    let value: QspVaribleType<Name> = this.readVariable(name, index);
    callback(value);
    const updater = () => {
      const newValue = this.readVariable(name, index);
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
  watchVariableByKey<Name extends string>(
    name: Name,
    key: string,
    callback: (value: QspVaribleType<Name>) => void
  ): () => void {
    let value: QspVaribleType<Name> = this.readVariableByKey(name, key);
    callback(value);
    const updater = () => {
      const newValue = this.readVariableByKey(name, key);
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
    console.log({ event, args });
    const list = this.listeners.get(event) ?? [];
    for (const listener of list) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      listener(...args);
    }
  }

  openGame(data: ArrayBuffer, isNewGame: boolean): void {
    withBufferWrite(this.module, data, (ptr, size) =>
      this.module._loadGameData(ptr, size, isNewGame ? 1 : 0)
    );
  }

  saveGame(): ArrayBuffer | null {
    const buffer = withBufferRead(this.module, (ptr) => this.module._saveGameData(ptr));
    if (!buffer) {
      this.onError();
      return null;
    }
    return buffer;
  }

  loadSave(data: ArrayBuffer): void {
    withBufferWrite(this.module, data, (ptr, size) => this.module._loadSavedGameData(ptr, size));
  }

  restartGame(): void {
    this.time = Date.now();
    this.module._restartGame();
  }

  selectAction(index: number): void {
    this.module._selectAction(index);
  }

  execSelectedAction(): void {
    this.module._executeSelAction();
  }

  selectObject(index: number): void {
    this.module._selectObject(index);
  }

  version(): string {
    return withStringRead(this.module, (ptr) => this.module._getVersion(ptr));
  }

  getStaticStringPointer(name: string): Ptr {
    const preparedName = name.toLocaleUpperCase();
    const namePtr = this.staticStrings.get(preparedName);
    if (namePtr) return namePtr;
    const newPtr = writeString(this.module, name);
    this.staticStrings.set(preparedName, newPtr);
    return newPtr;
  }

  readVariable<Name extends string>(name: Name, index?: number): QspVaribleType<Name> {
    const cacheKey = `${name}[${index || 0}]`;
    if (this.variableValues.has(cacheKey)) {
      return this.variableValues.get(cacheKey) as QspVaribleType<Name>;
    }
    if (name.startsWith('$')) {
      const value = this.readVariableString(name, index) as QspVaribleType<Name>;
      this.variableValues.set(cacheKey, value);
      return value;
    }
    const value = this.readVariableNumber(name, index) as QspVaribleType<Name>;
    this.variableValues.set(cacheKey, value);
    return value;
  }

  readVariableByKey<Name extends string>(name: Name, key: string): QspVaribleType<Name> {
    const cacheKey = `${name}[${key}]`;
    if (this.variableValues.has(cacheKey)) {
      return this.variableValues.get(cacheKey) as QspVaribleType<Name>;
    }
    if (name.startsWith('$')) {
      const value = this.readVariableStringByKey(name, key) as QspVaribleType<Name>;
      this.variableValues.set(cacheKey, value);
      return value;
    }
    const value = this.readVariableNumberByKey(name, key) as QspVaribleType<Name>;
    this.variableValues.set(cacheKey, value);
    return value;
  }

  readVariableNumber(name: string, index = 0): number {
    const namePtr = this.getStaticStringPointer(name.toLocaleUpperCase());
    return this.module._getVarNumValue(namePtr, index);
  }

  readVariableNumberByKey(name: string, key: string): number {
    const namePtr = this.getStaticStringPointer(name.toLocaleUpperCase());
    const keyPtr = this.getStaticStringPointer(key.toLocaleUpperCase());
    return this.module._getVarNumValueByKey(namePtr, keyPtr);
  }

  readVariableString(name: string, index = 0): string {
    const namePtr = this.getStaticStringPointer(name.toLocaleUpperCase());
    return withStringRead(this.module, (ptr) =>
      this.module._getVarStringValue(namePtr, index, ptr)
    );
  }

  readVariableStringByKey(name: string, key: string): string {
    const namePtr = this.getStaticStringPointer(name.toLocaleUpperCase());
    const keyPtr = this.getStaticStringPointer(key.toLocaleUpperCase());
    return withStringRead(this.module, (ptr) =>
      this.module._getVarStringValueByKey(namePtr, keyPtr, ptr)
    );
  }

  readVariableSize(name: string): number {
    const namePtr = this.getStaticStringPointer(name.toLocaleUpperCase());
    return this.module._getVarSize(namePtr);
  }

  execCode(code: string): void {
    withStringWrite(this.module, code, (ptr) => this.module._execString(ptr));
  }

  execCounter(): void {
    this.module._execCounter();
  }

  execLoc(name: string): void {
    withStringWrite(this.module, name, (ptr) => this.module._execLoc(ptr));
  }

  updateUserInput(code: string): void {
    withStringWrite(this.module, code, (ptr) => this.module._execUserInput(ptr));
  }

  private init(): void {
    this.module._init();
    this.module._initCallBacks();

    this.registerCallbacks();
  }

  private registerCallbacks(): void {
    this.module._setErrorCallback(this.module.addFunction(this.onError, 'i'));

    const callbacks = [
      [QspCallType.REFRESHINT, this.onRefresh, 'ii'],
      [QspCallType.SHOWWINDOW, this.onShowWindow, 'iii'],
      [QspCallType.SHOWMENU, this.onMenu, 'iii'],
      [QspCallType.SHOWMSGSTR, this.onMsg, 'ii'],
      [QspCallType.INPUTBOX, this.onInput, 'iiii'],
      [QspCallType.SLEEP, this.onWait, 'ii'],
      [QspCallType.SETTIMER, this.onSetTimer, 'ii'],
      [QspCallType.SETINPUTSTRTEXT, this.onSetUserInput, 'ii'],
      [QspCallType.SHOWIMAGE, this.onView, 'ii'],
      [QspCallType.DEBUG, this.onDebug, 'ii'],
      [QspCallType.GETMSCOUNT, this.onGetMS, 'i'],
      [QspCallType.OPENGAME, this.onOpenGame, 'iii'],
      [QspCallType.OPENGAMESTATUS, this.onOpenGameStatus, 'ii'],
      [QspCallType.SAVEGAMESTATUS, this.onSaveGameStatus, 'ii'],
      [QspCallType.ISPLAYINGFILE, this.onIsPlay, 'ii'],
      [QspCallType.PLAYFILE, this.onPlayFile, 'iii'],
      [QspCallType.CLOSEFILE, this.onCloseFile, 'ii'],
      [QspCallType.SYSTEM, this.onSystemCmd, 'ii'],
      [QspCallType.VERSION, this.onVersion, 'iiii'],
    ] as const;

    for (const [type, callback, signature] of callbacks) {
      this.registerCallback(type, callback, signature);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private registerCallback(type: QspCallType, callback: Function, signature: string): void {
    this.module._setCallBack(type, this.module.addFunction(callback, signature));
  }

  onError = (): void => {
    const errorData = this.readError();
    if (errorData) {
      console.error(errorData);
      this.emit('error', errorData);
    }
    this.onRefresh(true);
  };

  onRefresh = (isRedraw: boolean): void => {
    this.reportWatched();

    if (isRedraw || this.module._isMainDescChanged()) {
      const mainDesc = withStringRead(this.module, (ptr) => this.module._getMainDesc(ptr));
      this.emit('main_changed', mainDesc);
    }

    if (isRedraw || this.module._isVarsDescChanged()) {
      const varsDesc = withStringRead(this.module, (ptr) => this.module._getVarsDesc(ptr));
      this.emit('stats_changed', varsDesc);
    }

    if (isRedraw || this.module._isActionsChanged()) {
      const actions = withListRead(this.module, (ptr) => this.module._getActions(ptr));
      this.emit('actions_changed', actions);
    }

    if (isRedraw || this.module._isObjectsChanged()) {
      const objects = withListRead(this.module, (ptr) => this.module._getObjects(ptr));
      this.emit('objects_changed', objects);
    }
  };

  onShowWindow = (type: QspPanel, isShown: boolean): void => {
    this.emit('panel_visibility', type, isShown);
  };

  onMenu = (listPtr: Ptr, count: number): void => {
    const items = readListItems(this.module, listPtr, count);
    return asAsync(this.module, (done) => this.emit('menu', items, done));
  };

  onMsg = (textPtr: StringPtr): void => {
    this.onRefresh(false);
    const text = readString(this.module, textPtr);
    return asAsync(this.module, (done) => this.emit('msg', text, done));
  };

  onInput = (textPtr: StringPtr, retPtr: Ptr, maxSize: number): void => {
    this.onRefresh(false);
    const text = readString(this.module, textPtr);
    return asAsync(this.module, (done) => {
      const onInput = (inputText: string): void => {
        writeUTF32String(this.module, inputText, retPtr, maxSize);
        done();
      };
      this.emit('input', text, onInput);
    });
  };

  onVersion = (textPtr: StringPtr, retPtr: Ptr, maxSize: number): void => {
    const params = readString(this.module, textPtr);
    return asAsync(this.module, (done) => {
      const onVersion = (versionText: string): void => {
        writeUTF32String(this.module, versionText, retPtr, maxSize);
        done();
      };
      this.emit('version', params, onVersion);
    });
  };

  onWait = (ms: number): void => {
    return asAsync(this.module, (done) => this.emit('wait', ms, done));
  };

  onSetTimer = (ms: number): void => {
    this.emit('timer', ms);
  };

  onSetUserInput = (textPtr: StringPtr): void => {
    const text = readString(this.module, textPtr);
    this.emit('user_input', text);
  };

  onView = (pathPtr: StringPtr): void => {
    const path = readString(this.module, pathPtr);
    this.emit('view', path);
  };

  onDebug = (strPtr: StringPtr): void => {
    const text = readString(this.module, strPtr);
    console.log('DEBUG:', text);
  };

  onSystemCmd = (strPtr: StringPtr): void => {
    const text = readString(this.module, strPtr);
    this.emit('system_cmd', text);
  };

  onGetMS = (): number => {
    const elapsed = Date.now() - this.time;
    this.time = Date.now();
    return elapsed;
  };

  onOpenGame = (pathPtr: StringPtr, isNewGame: boolean): void => {
    const path = readString(this.module, pathPtr);
    return asAsync(this.module, (done) => this.emit('open_game', path, isNewGame, done));
  };

  onOpenGameStatus = (pathPtr: StringPtr): void => {
    const path = readString(this.module, pathPtr);
    return asAsync(this.module, (done) => this.emit('load_save', path, done));
  };

  onSaveGameStatus = (pathPtr: StringPtr): void => {
    const path = readString(this.module, pathPtr);
    return asAsync(this.module, (done) => this.emit('save_game', path, done));
  };

  onIsPlay = (filePtr: StringPtr): void => {
    const file = readString(this.module, filePtr);
    return asAsync(this.module, (done) =>
      this.emit('is_play', file, (result: boolean) => done(result ? 1 : 0))
    );
  };

  onPlayFile = (filePtr: StringPtr, volume: number): void => {
    const file = readString(this.module, filePtr);
    return asAsync(this.module, (done) => this.emit('play_file', file, volume, done));
  };

  onCloseFile = (filePtr: StringPtr): void => {
    const file = readString(this.module, filePtr);
    return asAsync(this.module, (done) => this.emit('close_file', file, done));
  };

  private reportWatched() {
    this.variableValues.clear();
    for (const updater of this.variableWatchers.values()) {
      updater();
    }
  }

  private readError(): QspErrorData | null {
    const code = this.module._getLastErrorNum();
    if (!code) return null;
    return {
      code,
      location: withStringRead(this.module, (ptr) => this.module._getLastErrorLoc(ptr)),
      description: withStringRead(this.module, (ptr) => this.module._getErrorDesc(ptr, code)),
      actionIndex: this.module._getLastErrorActIndex(),
      line: this.module._getLastErrorLine(),
    };
  }

  toJSON(): string {
    return '[QSP API]';
  }
}
