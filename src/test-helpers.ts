import path from 'path';
import fs from 'fs';
import { readQsps, writeQsp } from '@qsp/converters';
import { init } from './lib/qsp-engine';
import { QspAPI } from './contracts/api';

interface DoneCallback {
  (...args: unknown[]): unknown;
  fail(error?: string | { message: string }): unknown;
}

const wasm = fs.readFileSync(path.resolve('./src/qsplib/public/qsp-engine.wasm'));

export async function prepareApi(done: DoneCallback) {
  const api = await init(wasm.buffer);
  api.on('error', (data) => done.fail(JSON.stringify(data)));
  return api;
}

export function runTestFile(api: QspAPI, src: string) {
  const binary = writeQsp(readQsps(src));
  api.openGame(binary, true);
  api.execCode('gt "test"');
}
