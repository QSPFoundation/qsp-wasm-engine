export interface QspErrorData {
  errorCode: number;
  description: string;
  location: string;
  actionIndex: number;  
  line: number;
  localLine: number;
  lineSrc: string;
}

export interface QspListItem {
  name: string;
  image: string;
}

export interface QspObjectItem {
  name: string;
  image: string;
  title: string;
}

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
