import {
  QspAPI,
  QspErrorData,
  QspEvents,
  LayoutSettings,
  QspEventKeys,
  QspEventListeners,
  QspModule,
} from './contracts';
import { Ptr, QspCallType, QspPanel, Bool, StringPtr } from '../qsplib/public/types';
import { shallowEqual } from './helpers';
import {
  readListItems,
  readString,
  withBufferRead,
  withBufferWrite,
  withListRead,
  withStringRead,
  withStringWrite,
  writeString,
} from './pointers';

export class QspAPIImpl implements QspAPI {
  private listeners = new Map<QspEventKeys, QspEventListeners[]>();

  private time: number = Date.now();
  private layout: LayoutSettings | null = null;
  private staticStrings: Map<string, Ptr> = new Map();

  constructor(private module: QspModule) {
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

  private emit<E extends keyof QspEvents, CB extends QspEvents[E] = QspEvents[E]>(
    event: E,
    ...args: Parameters<CB>
  ): void {
    if (event !== 'refresh') {
      console.log({ event, args });
    }
    const list = this.listeners.get(event) ?? [];
    for (const listener of list) {
      // eslint-disable-next-line prefer-spread
      listener.apply(null, args);
    }
  }

  openGame(data: ArrayBuffer, isNewGame: boolean): void {
    withBufferWrite(this.module, data, (ptr, size) =>
      this.module._loadGameData(ptr, size, Number(isNewGame) as Bool)
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

  executeSelAction(): void {
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

  readVariableNumber(name: string, index = 0): number {
    const namePtr = this.getStaticStringPointer(name);
    return this.module._getVarNumValue(namePtr, index);
  }

  readVariableString(name: string, index = 0): string {
    const namePtr = this.getStaticStringPointer(name);
    return withStringRead(this.module, (ptr) =>
      this.module._getVarStringValue(namePtr, index, ptr)
    );
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

  execUserInput(code: string): void {
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
    this.updateLayout();

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

    this.emit('refresh');
  };

  onShowWindow = (type: QspPanel, isShown: boolean): void => {
    this.emit('panel_visibility', type, isShown);
  };

  onMenu = (listPtr: Ptr, count: number): void => {
    const items = readListItems(this.module, listPtr, count);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onSelect = (index: number): void => {
        wakeUp(index);
      };
      this.emit('menu', items, onSelect);
    });
  };

  onMsg = (textPtr: StringPtr): void => {
    this.onRefresh(false);
    const text = readString(this.module, textPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const closed = (): void => {
        wakeUp(0);
      };
      this.emit('msg', text, closed);
    });
  };

  onInput = (textPtr: StringPtr, retPtr: Ptr, maxSize: number): void => {
    this.onRefresh(false);
    const text = readString(this.module, textPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onInput = (inputText: string): void => {
        this.module.stringToUTF32(inputText, retPtr, maxSize);
        wakeUp(0);
      };
      this.emit('input', text, onInput);
    });
  };

  onWait = (ms: number): void => {
    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onWait = (): void => wakeUp(0);
      this.emit('wait', ms, onWait);
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
    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onOpened = (): void => {
        wakeUp(0);
      };
      this.emit('open_game', path, isNewGame, onOpened);
    });
  };

  onOpenGameStatus = (pathPtr: StringPtr): void => {
    const path = readString(this.module, pathPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onLoaded = (): void => {
        wakeUp(0);
      };
      this.emit('load_save', path, onLoaded);
    });
  };

  onSaveGameStatus = (pathPtr: StringPtr): void => {
    const path = readString(this.module, pathPtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onSaved = (): void => {
        wakeUp(0);
      };
      this.emit('save_game', path, onSaved);
    });
  };

  onIsPlay = (filePtr: StringPtr): void => {
    const file = readString(this.module, filePtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      this.emit('is_play', file, (result) => wakeUp(result ? 1 : 0));
    });
  };

  onPlayFile = (filePtr: StringPtr, volume: number): void => {
    const file = readString(this.module, filePtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onReady = (): void => {
        wakeUp(0);
      };
      this.emit('play_file', file, volume, onReady);
    });
  };

  onCloseFile = (filePtr: StringPtr): void => {
    const file = readString(this.module, filePtr);

    return this.module.Asyncify.handleSleep((wakeUp) => {
      const onReady = (): void => {
        wakeUp(0);
      };
      this.emit('close_file', file, onReady);
    });
  };

  private updateLayout(): void {
    const useHtml = Boolean(this.readVariableNumber('USEHTML'));
    const nosave = Boolean(this.readVariableNumber('NOSAVE'));
    const backgroundColor = this.readVariableNumber('BCOLOR');
    const color = this.readVariableNumber('FCOLOR');
    const linkColor = this.readVariableNumber('LCOLOR');
    const fontSize = this.readVariableNumber('FSIZE');
    const fontName = this.readVariableString('$FNAME');
    const backgroundImage = this.readVariableString('$BACKIMAGE');

    const layout = {
      nosave,
      useHtml,
      backgroundColor,
      backgroundImage,
      color,
      linkColor,
      fontSize,
      fontName,
    };

    if (!this.layout || !shallowEqual(this.layout, layout)) {
      this.layout = layout;
      this.emit('layout', this.layout);
    }
  }

  private readError(): QspErrorData | null {
    const code = this.module._getLastErrorNum();
    if (!code) return null;
    const description = withStringRead(this.module, (ptr) => this.module._getErrorDesc(ptr, code));
    const location = withStringRead(this.module, (ptr) => this.module._getLastErrorLoc(ptr));
    const actionIndex = this.module._getLastErrorActIndex();
    const line = this.module._getLastErrorLine();

    return {
      code,
      location,
      description,
      actionIndex,
      line,
    };
  }

  toJSON(): string {
    return '[QSP API]';
  }
}
