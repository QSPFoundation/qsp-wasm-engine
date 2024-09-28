import { QspAPI, QspTuple, QspVariableType } from '../contracts/api';
import { QspPanel } from '../contracts/common';
import { QspEventKeys, QspEventListeners, QspEvents } from '../contracts/events';
import { Ptr, QspCallType, QspWasmModule, StringPtr } from '../contracts/wasm-module';
import {
  asAsync,
  readListItems,
  readString,
  withBufferRead,
  withBufferWrite,
  withListRead,
  withStringListRead,
  withStringRead,
  withStringWrite,
  writeString,
  writeUTF32String,
  readError,
  allocPointer,
  derefPointer,
  withVariantRead,
  allocErrorInfoPointer,
} from './pointers';

export class QspAPIImpl implements QspAPI {
  private listeners = new Map<QspEventKeys, QspEventListeners[]>();
  private variableWatchers = new Set<() => void>();
  private variableValues = new Map<string, string | number | QspTuple>();

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
    callback: (value: QspVariableType<Name>) => void,
  ): () => void {
    let value: QspVariableType<Name> = this.readVariable(name);
    callback(value);
    const updater = () => {
      const newValue = this.readVariable(name);
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

  watchVariableByIndex<Name extends string>(
    name: Name,
    index: number,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void {
    let value: QspVariableType<Name> = this.readVariableByIndex(name, index);
    callback(value);
    const updater = () => {
      const newValue = this.readVariableByIndex(name, index);
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
    callback: (value: QspVariableType<Name>) => void,
  ): () => void {
    let value: QspVariableType<Name> = this.readVariableByKey(name, key);
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
    if (isNewGame) this._cleanup();
    withBufferWrite(this.module, data, (ptr, size) =>
      this.module._loadGameData(ptr, size, isNewGame ? 1 : 0),
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

  readVariable<Name extends string>(name: Name, useCache = false): QspVariableType<Name> {
    const nameUpper = name.toUpperCase();
    const cacheKey = `${nameUpper}[0]`;
    if (useCache && this.variableValues.has(cacheKey)) {
      return this.variableValues.get(cacheKey) as QspVariableType<Name>;
    }
    const namePtr = this.getStaticStringPointer(nameUpper);
    const value = withVariantRead(this.module, name, (resPtr) =>
      this.module._getVarValue(namePtr, resPtr),
    ) as QspVariableType<Name>;
    this.variableValues.set(cacheKey, value);
    return value;
  }

  readVariableByIndex<Name extends string>(
    name: Name,
    index: number,
    useCache = false,
  ): QspVariableType<Name> {
    const nameUpper = name.toUpperCase();
    const cacheKey = `${nameUpper}[${index}]`;
    if (useCache && this.variableValues.has(cacheKey)) {
      return this.variableValues.get(cacheKey) as QspVariableType<Name>;
    }
    const namePtr = this.getStaticStringPointer(nameUpper);
    const value = withVariantRead(this.module, name, (resPtr) =>
      this.module._getVarValueByIndex(namePtr, index, resPtr),
    ) as QspVariableType<Name>;
    this.variableValues.set(cacheKey, value);
    return value;
  }

  readVariableByKey<Name extends string>(
    name: Name,
    key: string,
    useCache = false,
  ): QspVariableType<Name> {
    const nameUpper = name.toUpperCase();
    const cacheKey = `${nameUpper}["${key}"]`;
    if (useCache && this.variableValues.has(cacheKey)) {
      return this.variableValues.get(cacheKey) as QspVariableType<Name>;
    }
    const namePtr = this.getStaticStringPointer(nameUpper);
    const keyPtr = this.getStaticStringPointer(key);
    const value = withVariantRead(this.module, name, (resPtr) =>
      this.module._getVarValueByKey(namePtr, keyPtr, resPtr),
    ) as QspVariableType<Name>;
    this.variableValues.set(cacheKey, value);
    return value;
  }

  readVariableSize(name: string): number {
    const namePtr = this.getStaticStringPointer(name.toLocaleUpperCase());
    return this.module._getVarSize(namePtr);
  }

  execCode(code: string, isRefresh = true): void {
    withStringWrite(this.module, code, (ptr) => this.module._execString(ptr, isRefresh ? 1 : 0));
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

  enableDebugMode(): void {
    this.module._enableDebugMode();
  }
  disableDebugMode(): void {
    this.module._disableDebugMode();
  }

  getLocationsList(): string[] {
    return withStringListRead(this.module, (ptr: Ptr) => this.module._getLocationsList(ptr));
  }

  getLocationCode(name: string): string[] {
    const namePtr = this.getStaticStringPointer(name);
    return withStringListRead(this.module, (ptr: Ptr) =>
      this.module._getLocationCode(namePtr, ptr),
    );
  }
  getActionCode(location: string, index: number): string[] {
    const namePtr = this.getStaticStringPointer(location);
    return withStringListRead(this.module, (ptr: Ptr) =>
      this.module._getActionCode(namePtr, index, ptr),
    );
  }

  private init(): void {
    this.module._init();

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

  private registerCallback(
    type: QspCallType,
    callback: (...args: never) => unknown,
    signature: string,
  ): void {
    this.module._setCallback(type, this.module.addFunction(callback, signature));
  }

  onError = (): void => {
    const ptr = allocErrorInfoPointer(this.module);
    this.module._getLastError(ptr);
    const error = readError(this.module, ptr);
    if (error.errorCode > 0)
      this.emit('error', error);
    this.module._free(ptr);
  };

  onRefresh = (isRedraw: boolean): void => {
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
    setTimeout(() => this.reportWatched(), 0);
  };

  onShowWindow = (type: QspPanel, isShown: boolean): void => {
    this.emit('panel_visibility', type, isShown);
  };

  onMenu = (listPtr: Ptr, count: number): void => {
    const items = readListItems(this.module, listPtr, count);
    return asAsync(this.module, (done) => {
      this.emit('menu', items, (index: number) => {
        done(index);
      });
    });
  };

  onMsg = (textPtr: StringPtr): void => {
    const text = readString(this.module, textPtr);
    return asAsync(this.module, (done) => {
      this.emit('msg', text, () => {
        done();
      });
    });
  };

  onInput = (textPtr: StringPtr, retPtr: Ptr, maxSize: number): void => {
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
    return asAsync(this.module, (done) => {
      this.emit('wait', ms, () => {
        done();
      });
    });
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
    const code = readString(this.module, strPtr);

    const actIndexPtr = allocPointer(this.module);
    const linePtr = allocPointer(this.module);
    const loc = withStringRead(this.module, (ptr) =>
      this.module._getCurStateData(ptr, actIndexPtr, linePtr),
    );
    const line = derefPointer(this.module, linePtr);
    this.module._free(linePtr);
    const actIndex = derefPointer(this.module, actIndexPtr);
    this.module._free(actIndexPtr);

    return asAsync(this.module, (done) => {
      this.emit(
        'debug',
        {
          code,
          loc,
          line,
          actIndex,
        },
        done,
      );
    });
  };

  onSystemCmd = (strPtr: StringPtr): void => {
    this.onRefresh(false);
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
    return asAsync(this.module, (done) => {
      this.emit('open_game', path, isNewGame, () => {
        done();
      });
    });
  };

  onOpenGameStatus = (pathPtr: StringPtr): void => {
    const path = readString(this.module, pathPtr);
    return asAsync(this.module, (done) => {
      this.emit('load_save', path, () => {
        done();
      });
    });
  };

  onSaveGameStatus = (pathPtr: StringPtr): void => {
    const path = readString(this.module, pathPtr);
    return asAsync(this.module, (done) => {
      this.emit('save_game', path, () => {
        done();
      });
    });
  };

  onIsPlay = (filePtr: StringPtr): void => {
    const file = readString(this.module, filePtr);
    return asAsync(this.module, (done) => {
      this.emit('is_play', file, (result: boolean) => {
        done(result ? 1 : 0);
      });
    });
  };

  onPlayFile = (filePtr: StringPtr, volume: number): void => {
    const file = readString(this.module, filePtr);
    return asAsync(this.module, (done) => {
      this.emit('play_file', file, volume, () => {
        done();
      });
    });
  };

  onCloseFile = (filePtr: StringPtr): void => {
    const file = readString(this.module, filePtr);
    return asAsync(this.module, (done) => {
      this.emit('close_file', file, () => {
        done();
      });
    });
  };

  clearCache() {
    this.variableValues.clear();
  }

  _run_checks() {
    this.module.__run_checks();
  }

  _cleanup() {
    this.clearCache();
    this.variableWatchers.clear();
    for (const ptr of this.staticStrings.values()) {
      this.module._free(ptr);
    }
    this.staticStrings.clear();
  }

  private reportWatched() {
    this.clearCache();
    for (const updater of this.variableWatchers.values()) {
      updater();
    }
  }

  toJSON(): string {
    return '[QSP API]';
  }
}
