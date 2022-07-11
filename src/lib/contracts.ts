import {
  Bool,
  BufferPtr,
  CharsPtr,
  FunctionPtr,
  IntPtr,
  Ptr,
  QspCallType,
  QspPanel,
  StringPtr,
} from '../qsplib/public/types';

export interface LayoutSettings {
  nosave: boolean;
  useHtml: boolean;
  backgroundColor: number;
  backgroundImage: string;
  color: number;
  linkColor: number;
  fontSize: number;
  fontName: string;
}

export type QspEvents = {
  main_changed: (text: string) => void;
  stats_changed: (text: string) => void;
  actions_changed: (actions: QspListItem[]) => void;
  objects_changed: (objects: QspListItem[]) => void;
  panel_visibility: (type: QspPanel, isShown: boolean) => void;
  user_input: (text: string) => void;
  error: (errorData: QspErrorData) => void;
  layout: (settings: LayoutSettings) => void;
  menu: (items: QspListItem[], select: (index: number) => void) => void;
  msg: (text: string, closed: () => void) => void;
  input: (text: string, onInput: (text: string) => void) => void;
  wait: (ms: number, onComplete: () => void) => void;
  timer: (ms: number) => void;
  view: (path: string) => void;
  open_game: (path: string, isNewGame: boolean, onOpened: () => void) => void;
  save_game: (path: string, onSaved: () => void) => void;
  load_save: (path: string, onLoaded: () => void) => void;
  is_play: (file: string, onResult: (result: boolean) => void) => void;
  play_file: (path: string, volume: number, onReady: () => void) => Promise<void>;
  close_file: (path: string, onReady: () => void) => void;
  refresh: () => void;
  system_cmd: (cmd: string) => void;
};

export type QspEventKeys = keyof QspEvents;
export type QspEventListeners = QspEvents[QspEventKeys];

export interface QspAPI {
  on<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  off<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  version(): string;
  openGame(data: ArrayBuffer, isNewGame: boolean): void;
  saveGame(): ArrayBuffer | null;
  loadSave(data: ArrayBuffer): void;
  restartGame(): void;
  selectAction(index: number): void;
  executeSelAction(): void;
  selectObject(index: number): void;
  readVariableNumber(name: string, index?: number): number;
  readVariableString(name: string, index?: number): string;
  execCode(code: string): void;
  execCounter(): void;
  execUserInput(code: string): void;
  execLoc(name: string): void;
}

export interface QspErrorData {
  code: number;
  description: string;
  location: string;
  actionIndex: number;
  line: number;
}

export interface QspListItem {
  name: string;
  image: string;
}

type IRType = 'i8' | 'i16' | 'i32' | 'i64' | 'float' | 'double';

export interface QspModule extends EmscriptenModule {
  UTF32ToString(ptr: CharsPtr, maxBytesToRead?: number): string;
  stringToUTF32(str: string, outPtr: CharsPtr, maxBytes?: number): number;
  lengthBytesUTF32(str: string): number;
  getValue(ptr: Ptr, type: IRType): number;
  addFunction(fn: Function, signature: string): FunctionPtr; //eslint-disable-line @typescript-eslint/ban-types
  Asyncify: {
    handleSleep(cb: (wakeUp: (ret: number) => void) => void): void;
  };

  _freeString(string: CharsPtr): void;
  _freeItemsList(items: Ptr): void;
  _freeSaveBuffer(buffer: Ptr): void;

  // libqsp
  _init(): void;
  _dispose(): void;

  _setErrorCallback(fnPtr: FunctionPtr): void;

  _getVersion(ptr: Ptr): void;

  _getMainDesc(ptr: Ptr): void;
  _isMainDescChanged(): Bool;

  _getVarsDesc(ptr: Ptr): void;
  _isVarsDescChanged(): Bool;

  _getActions(list: Ptr): number;
  _selectAction(index: number): void;
  _executeSelAction(): void;
  _isActionsChanged(): Bool;

  _getObjects(list: Ptr): number;
  _selectObject(index: number): void;
  _isObjectsChanged(): Bool;

  _loadGameData(data: BufferPtr, size: number, isNewGame: Bool): void;
  _restartGame(): void;
  _saveGameData(realSize: IntPtr): Ptr;
  _loadSavedGameData(data: BufferPtr, size: number): void;

  _execString(input: CharsPtr): void;
  _execCounter(): void;
  _execUserInput(input: CharsPtr): void;
  _execLoc(input: CharsPtr): void;

  _getLastErrorData(errorNum: IntPtr, errorLoc: StringPtr, errorActIndex: IntPtr, errorLine: IntPtr): void;
  _getErrorDesc(ptr: Ptr, errorNum: number): void;

  _getVarStringValue(name: CharsPtr, index: number, result: Ptr): void;
  _getVarNumValue(name: CharsPtr, index: number): number;

  _initCallBacks(): void;
  _setCallBack(type: QspCallType, fnPtr: FunctionPtr): void;
}
