import { QspEvents, QspEventLogger } from './events';
import { QspListItem } from './common';

import type { QspTuple, QspVariableKey, QspVariableValue } from '../qsplib/public/qsp-wasm-module';
export type { QspTuple, QspVariableKey, QspVariableValue } from '../qsplib/public/qsp-wasm-module';
// a name without a type prefix reads the stored value as is, $name / #name / %name read it
// as a string / number / tuple (the empty value of that type if the stored type differs)
export type QspVariableType<Name extends string> = Name extends `$${infer _A}`
  ? string
  : Name extends `%${infer _A}`
    ? QspTuple
    : Name extends `#${infer _A}`
      ? number
      : QspVariableValue;
export interface QspVariableItem<Name extends string> {
  value: QspVariableType<Name>;
  key: string | QspTuple | undefined; // undefined if the item has no key
}

export interface QspAPI {
  on<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  off<E extends keyof QspEvents>(event: E, callback: QspEvents[E]): void;
  registerEventLogger(logger: QspEventLogger): void;
  version(): string;
  // The calls that execute game code resolve when the engine finishes them
  openGame(data: ArrayBuffer, isNewGame: boolean): Promise<void>;
  saveGame(): Promise<ArrayBuffer | null>;
  loadSave(data: ArrayBuffer): Promise<void>;
  restartGame(): Promise<void>;
  selectAction(index: number): Promise<void>;
  execSelectedAction(): Promise<void>;
  selectObject(index: number): Promise<void>;
  // useCache: the value is read once until the engine runs code
  readVariable<Name extends string>(name: Name, useCache?: boolean): QspVariableType<Name>;
  readVariableByIndex<Name extends string>(
    name: Name,
    index: number,
    useCache?: boolean,
  ): QspVariableType<Name>;
  readVariableByKey<Name extends string>(
    name: Name,
    key: QspVariableKey,
    useCache?: boolean,
  ): QspVariableType<Name>;
  readVariableIndexByKey(name: string, key: QspVariableKey): number;
  readVariableItem<Name extends string>(name: Name, index: number): QspVariableItem<Name>;
  readVariableSize(name: string): number;
  execCode(code: string): Promise<void>;
  execCounter(): Promise<void>;
  updateUserInput(code: string): Promise<void>;
  execLoc(name: string): Promise<void>;
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
    key: QspVariableKey,
    callback: (value: QspVariableType<Name>) => void,
  ): () => void;

  enableDebugMode(): void;
  disableDebugMode(): void;

  getLocationsList(): string[];
  getLocationActions(name: string): QspListItem[];
  getLocationCode(name: string): string[];
  getActionCode(name: string, index: number): string[];

  // Expression evaluation
  calculateStringExpression(expression: string): Promise<string>;
  calculateNumericExpression(expression: string): Promise<number | null>;

  // Window management
  showWindow(type: number, show: boolean): void;

  // Selection getters
  getSelectedActionIndex(): number;
  getSelectedObjectIndex(): number;

  // Utility functions
  getCompiledDateTime(): string;
  getErrorDescription(errorNum: number): string;

  // Location description
  getLocationDescription(name: string): string;

  // Terminates the engine and frees the memory of the API, the instance can't be used afterwards
  dispose(): void;
  clearCache(): void;
  _run_checks(): void;
}
