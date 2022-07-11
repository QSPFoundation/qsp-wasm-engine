/// <reference types="emscripten" />
import { QspModule } from '../../lib/contracts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Module(emscriptenArgs: any): Promise<QspModule>;
