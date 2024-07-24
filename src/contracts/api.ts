import { QspEvents } from './events';

export type QspVariableType<Name extends string> = Name extends `$${infer _A}` ? string : number;

export interface QspAPI {
  on<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  off<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  version(): string;
  openGame(data: ArrayBuffer, isNewGame: boolean): void;
  saveGame(): ArrayBuffer | null;
  loadSave(data: ArrayBuffer): void;
  restartGame(): void;
  selectAction(index: number): void;
  execSelectedAction(): void;
  selectObject(index: number): void;
  readVariable<Name extends string>(name: Name, index?: number): QspVariableType<Name>;
  readVariableByKey<Name extends string>(name: Name, key: string): QspVariableType<Name>;
  readVariableSize(name: string): number;
  execCode(code: string): void;
  execCounter(): void;
  updateUserInput(code: string): void;
  execLoc(name: string): void;
  watchVariable<Name extends string>(
    name: Name,
    index: number,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void;
  watchVariableByKey<Name extends string>(
    name: Name,
    key: string,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void;
  watchExpression(expr: string, callback: (value: number) => void): () => void;
  clearCache(): void;

  enableDebugMode(): void;
  disableDebugMode(): void;

  getLocationsList(): void;
  getLocationCode(name: string): string[];
  getActionCode(name: string, index: number): string[];
}
