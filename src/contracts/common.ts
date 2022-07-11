export interface QspErrorData {
  code: number;
  description: string;
  location: string;
  actionIndex: number;
  line: number;
}

export interface QspListItem {
  name: string;
  image: string;
}

export enum QspPanel {
  ACTS,
  OBJS,
  VARS,
  INPUT,
}
