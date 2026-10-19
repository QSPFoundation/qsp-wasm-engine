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

// Runs the test location to its end
export async function runTestFile(api: QspAPI, src: string): Promise<void> {
  await api.openGame(writeQsp(readQsps(prepareTest(src))), true);
  await api.execLoc('test');
}

// Starts the test location: resolves once it waits for an answer (or ends), done settles at its end
export async function startTestFile(api: QspAPI, src: string): Promise<{ done: Promise<void> }> {
  await api.openGame(writeQsp(readQsps(prepareTest(src))), true);
  return { done: api.execLoc('test') };
}

export function loadTestLocations(api: QspAPI, locations: QspLocation[]): Promise<void> {
  const binary = writeQsp(locations);
  return api.openGame(binary, true);
}

export async function runTestFileWithGoto(api: QspAPI, src: string): Promise<void> {
  await api.openGame(writeQsp(readQsps(prepareTest(src))), true);
  await api.execCode('gt "test"');
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
