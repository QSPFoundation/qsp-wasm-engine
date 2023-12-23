import { QspListItem } from '../contracts/common';
import { CharsPtr, Ptr, QspWasmModule, StringPtr } from '../contracts/wasm-module';

export const POINTER_SIZE = 4; // pointers are 4 bytes in C

export function allocStringPointer(module: QspWasmModule): Ptr {
  return module._malloc(POINTER_SIZE * 2);
}

export function allocPointer(module: QspWasmModule): Ptr {
  return module._malloc(POINTER_SIZE);
}

export function derefPointer(module: QspWasmModule, ptr: Ptr): Ptr {
  return readI32Value(module, ptr);
}

export function movePointer(ptr: Ptr, times = 1): Ptr {
  return ptr + POINTER_SIZE * times;
}

export function freePointer(module: QspWasmModule, ptr: Ptr): void {
  module._free(ptr);
}

export function readInt(module: QspWasmModule, ptr: Ptr): number {
  return readI32Value(module, ptr);
}

export function readString(module: QspWasmModule, ptr: StringPtr): string {
  const start = derefPointer(module, ptr);
  if (!start) {
    return '';
  }
  const end = derefPointer(module, movePointer(ptr));
  return readUTF32String(module, start, end - start);
}

export function writeString(module: QspWasmModule, value: string): CharsPtr {
  const length = lengthBytesUTF32(value);
  const ptr = module._malloc(length + 4);
  writeUTF32String(module, value, ptr, length + 4);
  return ptr;
}

export function withStringRead(module: QspWasmModule, callback: (ptr: Ptr) => void): string {
  const ptr = allocStringPointer(module);
  callback(ptr);
  const result = readString(module, ptr);
  freePointer(module, ptr);
  return result;
}

export function withStringWrite(
  module: QspWasmModule,
  value: string,
  callback: (ptr: Ptr) => void,
): void {
  const ptr = writeString(module, value);
  callback(ptr);
  module._free(ptr);
}

export function withListRead(module: QspWasmModule, callback: (ptr: Ptr) => Ptr): QspListItem[] {
  const countPtr = allocPointer(module);

  const listPtr = callback(countPtr);
  const count = readInt(module, countPtr);
  const list = readListItems(module, listPtr, count);

  module._freeItemsList(listPtr);
  freePointer(module, countPtr);

  return list;
}

export function withBufferWrite(
  module: QspWasmModule,
  data: ArrayBuffer,
  callback: (ptr: Ptr, size: number) => void,
): void {
  const bytes = new Uint8Array(data);
  const ptr = module._malloc(bytes.length);
  module.HEAPU8.set(bytes, ptr);
  callback(ptr, bytes.length);
  module._free(ptr);
}

export function withBufferRead(
  module: QspWasmModule,
  callback: (ptr: Ptr) => Ptr,
): ArrayBuffer | null {
  const sizePtr = allocPointer(module);
  const bufferPtr = callback(sizePtr);
  const size = readI32Value(module, sizePtr);
  if (!size) {
    freePointer(module, sizePtr);
    return null;
  }

  const data = module.HEAPU8.slice(bufferPtr, bufferPtr + size);

  module._freeSaveBuffer(bufferPtr);
  freePointer(module, sizePtr);

  return data.buffer;
}

export function readListItems(module: QspWasmModule, listPtr: Ptr, count: number): QspListItem[] {
  const list: QspListItem[] = [];
  let ptr = listPtr;
  for (let i = 0; i < count; i++) {
    const image = readString(module, ptr);
    ptr = movePointer(ptr, 2);

    const name = readString(module, ptr);
    ptr = movePointer(ptr, 2);

    list.push({
      name,
      image,
    });
  }
  return list;
}

export function asAsync(
  module: QspWasmModule,
  callback: (done: (result?: number) => void) => void,
) {
  return module.Asyncify.handleSleep((wakeUp) => {
    callback((result) => wakeUp(result || 0));
  });
}

function readI32Value(module: QspWasmModule, ptr: Ptr): number {
  return module.HEAP32[ptr >> 2];
}

function lengthBytesUTF32(str: string): number {
  let len = 0;
  for (let i = 0; i < str.length; ++i) {
    const codeUnit = str.charCodeAt(i);
    if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
    len += 4;
  }
  return len;
}

export function writeUTF32String(
  module: QspWasmModule,
  str: string,
  outPtr: Ptr,
  maxBytesToWrite = 2147483647,
): number {
  if (maxBytesToWrite < 4) return 0;
  const startPtr = outPtr;
  const endPtr = startPtr + maxBytesToWrite - 4;
  for (let i = 0; i < str.length; ++i) {
    let codeUnit = str.charCodeAt(i);
    if (codeUnit >= 55296 && codeUnit <= 57343) {
      const trailSurrogate = str.charCodeAt(++i);
      codeUnit = (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
    }
    module.HEAP32[outPtr >> 2] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  module.HEAP32[outPtr >> 2] = 0;
  return outPtr - startPtr;
}

function readUTF32String(module: QspWasmModule, ptr: Ptr, maxBytesToRead: number): string {
  let i = 0;
  const str: string[] = [];
  while (!(i >= maxBytesToRead / 4)) {
    const utf32 = module.HEAP32[(ptr + i * 4) >> 2];
    if (utf32 == 0) break;
    ++i;
    if (utf32 >= 65536) {
      const ch = utf32 - 65536;
      str.push(String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023)));
    } else {
      str.push(String.fromCharCode(utf32));
    }
  }
  return str.join('');
}
