export type { QspErrorData, QspListItem, QspObjectItem } from '../qsplib/public/qsp-wasm-module';

export enum QspPanel {
  MAIN = 1,
  VARS = 2,
  ACTS = 4,
  OBJS = 8,
  INPUT = 16,
  VIEW = 32,
}

export interface DebugRecord {
  code: string;
  loc: string;
  line: number;
  actIndex: number;
}
