/// <reference types="emscripten" />
import { QspWasmModule } from '../../contracts/wasm-module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Module(emscriptenArgs: any): Promise<QspWasmModule>;
