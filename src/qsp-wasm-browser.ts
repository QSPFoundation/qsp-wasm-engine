import { QspAPI } from './contracts/api';
import { init } from './lib/qsp-wasm';

export async function initQspEngine(wasmPath: string): Promise<QspAPI> {
  const wasm = await fetch(wasmPath).then((r) => r.arrayBuffer());
  return init(wasm);
}
