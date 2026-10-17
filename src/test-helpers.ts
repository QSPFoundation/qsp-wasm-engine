import path from 'path';
import fs from 'fs';
import { QspLocation, readQsps, writeQsp } from '@qsp/converters';
import { QspAPI } from './contracts/api';

import { initDebugQspEngine } from './lib/qsp-engine-debug';
import { initQspEngine } from './lib/qsp-engine';

const wasmPath = process.env.DEBUG
  ? './src/qsplib/public/qsp-engine-debug.wasm'
  : './src/qsplib/public/qsp-engine.wasm';
const wasm = fs.readFileSync(path.resolve(wasmPath));

export async function prepareApi() {
  const api = process.env.DEBUG
    ? await initDebugQspEngine(wasm.buffer)
    : await initQspEngine(wasm.buffer);
  return api;
}

// openGame runs no game code: the game is loaded when it returns, so tests can check sync effects
export function runTestFile(api: QspAPI, src: string): Promise<void> {
  const binary = writeQsp(readQsps(prepareTest(src)));
  void api.openGame(binary, true);
  return api.execLoc('test');
}

export function loadTestLocations(api: QspAPI, locations: QspLocation[]): Promise<void> {
  const binary = writeQsp(locations);
  return api.openGame(binary, true);
}

export function runTestFileWithGoto(api: QspAPI, src: string): Promise<void> {
  const binary = writeQsp(readQsps(prepareTest(src)));
  void api.openGame(binary, true);
  return api.execCode('gt "test"');
}

export function prepareTest(textData: string): string {
  return `#start
---
#test
${textData}
---`;
}

export function nextTick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
