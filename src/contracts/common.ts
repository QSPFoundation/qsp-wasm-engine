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

export enum QspPanel {
  ACTS,
  OBJS,
  STAT,
  INPUT,
}

export interface DebugRecord {
  code: string;
  loc: string;
  line: number;
  actIndex: number;
}
