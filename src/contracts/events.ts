import { QspErrorData, QspListItem, QspPanel } from "./common";

export type QspEvents = {
  main_changed: (text: string) => void;
  stats_changed: (text: string) => void;
  actions_changed: (actions: QspListItem[]) => void;
  objects_changed: (objects: QspListItem[]) => void;
  panel_visibility: (type: QspPanel, isShown: boolean) => void;
  user_input: (text: string) => void;
  error: (errorData: QspErrorData) => void;
  menu: (items: QspListItem[], select: (index: number) => void) => void;
  msg: (text: string, closed: () => void) => void;
  input: (text: string, onInput: (text: string) => void) => void;
  version: (param: string, onVersion: (text: string) => void) => void;
  wait: (ms: number, onComplete: () => void) => void;
  timer: (ms: number) => void;
  view: (path: string) => void;
  open_game: (path: string, isNewGame: boolean, onOpened: () => void) => void;
  save_game: (path: string, onSaved: () => void) => void;
  load_save: (path: string, onLoaded: () => void) => void;
  is_play: (file: string, onResult: (result: boolean) => void) => void;
  play_file: (path: string, volume: number, onReady: () => void) => void;
  close_file: (path: string, onReady: () => void) => void;
  system_cmd: (cmd: string) => void;
};

export type QspEventKeys = keyof QspEvents;
export type QspEventListeners = QspEvents[QspEventKeys];
