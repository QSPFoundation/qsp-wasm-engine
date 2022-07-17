import { QspAPI } from '../contracts/api';
import createQspModule from '../qsplib/public/qsp-engine';

import { QspAPIImpl } from './qsp-api';

export function init(wasmBinary: ArrayBufferView | ArrayBuffer): Promise<QspAPI> {
  return new Promise((resolve) => {
    createQspModule({
      wasmBinary,
    }).then((moduleWasm) => {
      resolve(new QspAPIImpl(moduleWasm));
    });
  });
}
