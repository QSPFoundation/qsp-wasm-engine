import { QspAPI } from '../contracts/api';
import createQspModule from '../qsplib/public/qsp-wasm';

import { QspAPIImpl } from './qsp-api';

export function init(wasm: ArrayBufferView | ArrayBuffer): Promise<QspAPI> {
  return new Promise((resolve) => {
    createQspModule({
      wasm,
    }).then((moduleWasm) => {
      resolve(new QspAPIImpl(moduleWasm));
    });
  });
}
