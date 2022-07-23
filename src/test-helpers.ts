import path from 'path';
import fs from 'fs';
import { readQsps, writeQsp } from '@qsp/converters';
import { init } from './lib/qsp-engine';
import { QspAPI } from './contracts/api';

const wasm = fs.readFileSync(path.resolve('./src/qsplib/public/qsp-engine.wasm'));

export async function prepareApi() {
  const api = await init(wasm.buffer);
  return api;
}

export function runTestFile(api: QspAPI, src: string) {
  const binary = writeQsp(readQsps(prepareTest(src)));
  api.openGame(binary, true);
  api.execLoc('test');
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
