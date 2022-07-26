import { QspEvents } from './events';

export type QspVaribleType<Name extends string> = Name extends `${infer A}` ? string : number;

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
  readVariable<Name extends string>(name: Name, index?: number): QspVaribleType<Name>;
  readVariableByKey<Name extends string>(name: Name, key: string): QspVaribleType<Name>;
  readVariableSize(name: string): number;
  execCode(code: string): void;
  execCounter(): void;
  execUserInput(code: string): void;
  execLoc(name: string): void;
  watchVariables(
    variables: string[],
    callback: (data: Record<string, string | number>) => void
  ): () => void;
}
