import { QspEvents } from './events';
import { QspListItem } from './common';

export type QspTuple = Array<string | number | QspTuple>;
export type QspVariableType<Name extends string> = Name extends `$${infer _A}`
  ? string
  : Name extends `%${infer _A}`
    ? QspTuple
    : number;

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
  readVariable<Name extends string>(name: Name): QspVariableType<Name>;
  readVariableByIndex<Name extends string>(name: Name, index: number): QspVariableType<Name>;
  readVariableByKey<Name extends string>(name: Name, key: string): QspVariableType<Name>;
  readVariableSize(name: string): number;
  execCode(code: string): void;
  execCounter(): void;
  updateUserInput(code: string): void;
  execLoc(name: string): void;
  watchVariable<Name extends string>(
    name: Name,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void;
  watchVariableByIndex<Name extends string>(
    name: Name,
    index: number,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void;
  watchVariableByKey<Name extends string>(
    name: Name,
    key: string,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void;
  clearCache(): void;

  enableDebugMode(): void;
  disableDebugMode(): void;

  getLocationsList(): string[];
  getLocationActions(name: string): QspListItem[];
  getLocationCode(name: string): string[];
  getActionCode(name: string, index: number): string[];

  _cleanup(): void;
  _run_checks(): void;
}
