import { QspEvents } from "./events";

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