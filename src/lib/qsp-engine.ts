import { QspAPI } from '../contracts/api';
import createQspModule from '../qsplib/public/qsp-engine';

import { QspAPIImpl } from './qsp-api';

export function initQspEngine(
  wasmBinary: ArrayBufferView | ArrayBuffer,
  options?: { seed?: number },
): Promise<QspAPI> {
  return new Promise((resolve) => {
    createQspModule({
      wasmBinary,
    }).then((moduleWasm) => {
      resolve(new QspAPIImpl(moduleWasm, options?.seed));
    });
  });
}
