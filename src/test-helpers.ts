import path from 'path';
import fs from 'fs';
import { readQsps, writeQsp } from '@qsp/converters';
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

export function runTestFile(api: QspAPI, src: string) {
  const binary = writeQsp(readQsps(prepareTest(src)));
  api.openGame(binary, true);
  api.execLoc('test');
}

export function runTestFileWithGoto(api: QspAPI, src: string) {
  const binary = writeQsp(readQsps(prepareTest(src)));
  api.openGame(binary, true);
  api.execCode('gt "test"');
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
