export type CharsPtr = number;
export type BufferPtr = number;
export type Ptr = number;
export type IntPtr = number;
export type FunctionPtr = number;
export type StringPtr = number;
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
  VERSION, /* void func(QSPString param, QSP_CHAR *buffer, int maxLen) */
  DUMMY,
}

export interface QspWasmModule extends EmscriptenModule {
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

  _execString(input: CharsPtr, isRefresh: Bool): void;
  _execCounter(): void;
  _execUserInput(input: CharsPtr): void;
  _execLoc(input: CharsPtr): void;

  _getLastErrorNum(): number;
  _getLastErrorLoc(ptr: Ptr): void;
  _getLastErrorActIndex(): number;
  _getLastErrorLine(): number;
  _getErrorDesc(ptr: Ptr, errorNum: number): void;

  _getVarStringValue(name: CharsPtr, index: number, result: Ptr): void;
  _getVarNumValue(name: CharsPtr, index: number): number;
  _getVarStringValueByKey(name: CharsPtr, key: CharsPtr, result: Ptr): void;
  _getVarNumValueByKey(name: CharsPtr, key: CharsPtr): number;
  _getVarSize(name: CharsPtr): number;

  _initCallBacks(): void;
  _setCallBack(type: QspCallType, fnPtr: FunctionPtr): void;
}
