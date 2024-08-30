type Brand<T> = T & {readonly brand: unique symbol}
export type CharsPtr = Brand<number>;
export type BufferPtr = Brand<number>;
export type Ptr = Brand<number>;
export type IntPtr = Brand<number>;
export type FunctionPtr = Brand<number>;
export type StringPtr = Brand<number>;
export type ErrorPtr = Brand<number>;
export type VariantPointer = Brand<number>;
export type Bool = 0 | 1;

export enum QspCallType {
  DEBUG /* void func(QSPString str) */,
  ISPLAYINGFILE /* QSP_BOOL func(QSPString file) */,
  PLAYFILE /* void func(QSPString file, int volume) */,
  CLOSEFILE /* void func(QSPString file) */,
  SHOWIMAGE /* void func(QSPString file) */,
  SHOWWINDOW /* void func(int type, QSP_BOOL isShow) */,
  SHOWMENU /* int func(QSPListItem *items, int count) */,
  SHOWMSGSTR /* void func(QSPString text) */,
  REFRESHINT /* void func(QSP_BOOL isRedraw) */,
  SETTIMER /* void func(int msecs) */,
  SETINPUTSTRTEXT /* void func(QSPString text) */,
  SYSTEM /* void func(QSPString cmd) */,
  OPENGAME /* void func(QSP_BOOL isNewGame) */,
  OPENGAMESTATUS /* void func(QSPString file) */,
  SAVEGAMESTATUS /* void func(QSPString file) */,
  SLEEP /* void func(int msecs) */,
  GETMSCOUNT /* int func() */,
  INPUTBOX /* void func(QSPString text, QSP_CHAR *buffer, int maxLen) */,
  VERSION /* void func(QSPString param, QSP_CHAR *buffer, int maxLen) */,
  DUMMY,
}

export interface QspWasmModule extends EmscriptenModule {
  addFunction(fn: (...args: never) => unknown, signature: string): FunctionPtr;
  Asyncify: {
    handleSleep(cb: (wakeUp: (ret: number) => void) => void): void;
  };

  _freeString(string: CharsPtr): void;
  _freeItemsList(items: Ptr): void;
  _freeSaveBuffer(buffer: Ptr): void;
  _freeStringsBuffer(buffer: Ptr): void;

  // libqsp
  _init(): void;
  _dispose(): void;

  _setErrorCallback(fnPtr: FunctionPtr): void;

  _getVersion(ptr: Ptr): void;

  _getMainDesc(ptr: Ptr): void;
  _isMainDescChanged(): Bool;

  _getVarsDesc(ptr: Ptr): void;
  _isVarsDescChanged(): Bool;

  _getActions(list: Ptr): Ptr;
  _selectAction(index: number): void;
  _executeSelAction(): void;
  _isActionsChanged(): Bool;

  _getObjects(list: Ptr): Ptr;
  _selectObject(index: number): void;
  _isObjectsChanged(): Bool;

  _loadGameData(data: BufferPtr, size: number, isNewGame: Bool): void;
  _restartGame(): void;
  _saveGameData(realSize: IntPtr): Ptr;
  _loadSavedGameData(data: BufferPtr, size: number): void;

  _execString(input: CharsPtr, isRefresh: Bool): void;
  _execCounter(): void;
  _execUserInput(input: CharsPtr): void;
  _execLoc(input: CharsPtr): void;

  _getLastError(ptr: ErrorPtr): void;

  _getVarSize(name: CharsPtr): number;
  _getVarValue(name: CharsPtr, result: VariantPointer): Bool;
  _getVarValueByIndex(name: CharsPtr, index: number, result: VariantPointer): Bool;
  _getVarValueByKey(name: CharsPtr, key: CharsPtr, result: VariantPointer): Bool;

  _setCallback(type: QspCallType, fnPtr: FunctionPtr): void;

  _enableDebugMode(): void;
  _getCurStateData(location: StringPtr, actIndex: Ptr, line: Ptr): void;
  _disableDebugMode(): void;

  _getLocationsList( count: Ptr): Ptr;
  _getLocationCode(name: CharsPtr, count: Ptr): Ptr;
  _getActionCode(name: CharsPtr, index: number, count: Ptr): Ptr;

  __run_checks(): void;
}
