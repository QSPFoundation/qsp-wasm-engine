import { QspAPI } from './contracts/api';
import { init } from './lib/qsp-engine';
import fsp from 'fs/promises';

export async function initQspEngine(filePath: string): Promise<QspAPI> {
  const wasm = await fsp.readFile(filePath);
  return init(wasm.buffer);
}
