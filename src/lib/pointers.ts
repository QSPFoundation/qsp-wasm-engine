import { CharsPtr, Ptr, StringPtr } from '../qsplib/public/types';
import { QspListItem, QspModule } from './contracts';

export const POINTER_SIZE = 4; // pointers are 4 bytes in C

export function allocStringPointer(module: QspModule): Ptr {
  return module._malloc(POINTER_SIZE * 2);
}

export function allocPointer(module: QspModule): Ptr {
  return module._malloc(POINTER_SIZE);
}

export function derefPointer(module: QspModule, ptr: Ptr): Ptr {
  return module.getValue(ptr, 'i32');
}

export function movePointer(ptr: Ptr, times = 1): Ptr {
  return ptr + POINTER_SIZE * times;
}

export function freePointer(module: QspModule, ptr: Ptr): void {
  module._free(ptr);
}

export function readInt(module: QspModule, ptr: Ptr): number {
  return module.getValue(ptr, 'i32');
}

export function readString(module: QspModule, ptr: StringPtr): string {
  const start = derefPointer(module, ptr);
  if (!start) {
    return '';
  }
  const end = derefPointer(module, movePointer(ptr));
  return module.UTF32ToString(start, end - start);
}

export function writeString(module: QspModule, value: string): CharsPtr {
  const length = module.lengthBytesUTF32(value);
  const ptr = module._malloc(length + 4);
  module.stringToUTF32(value, ptr, length + 4);
  return ptr;
}

export function withStringRead(module: QspModule, callback: (ptr: Ptr) => void): string {
  const ptr = allocStringPointer(module);
  callback(ptr);
  const result = this.readString(ptr);
  freePointer(module, ptr);
  return result;
}

export function withStringWrite(
  module: QspModule,
  value: string,
  callback: (ptr: Ptr) => void
): void {
  const ptr = writeString(module, value);
  callback(ptr);
  module._free(ptr);
}

export function withListRead(module: QspModule, callback: (ptr: Ptr) => Ptr): QspListItem[] {
  const countPtr = allocPointer(module);

  const listPtr = callback(countPtr);
  const count = readInt(module, countPtr);
  const list = readListItems(module, listPtr, count);

  this.module._freeItemsList(listPtr);
  this.freePtr(countPtr);

  return list;
}

export function withBufferWrite(
  module: QspModule,
  data: ArrayBuffer,
  callback: (ptr: Ptr, size: number) => void
): void {
  const bytes = new Uint8Array(data);
  const ptr = module._malloc(bytes.length);
  module.HEAPU8.set(bytes, ptr);
  callback(ptr, bytes.length);
  module._free(ptr);
}

export function withBufferRead(module: QspModule, callback: (ptr: Ptr) => Ptr): ArrayBuffer | null {
  const sizePtr = allocPointer(module);
  const bufferPtr = callback(sizePtr);
  const size = module.getValue(sizePtr, 'i32');
  if (!size) {
    this.freePtr(sizePtr);
    return null;
  }

  const data = this.module.HEAPU8.slice(bufferPtr, bufferPtr + size);

  this.module._freeSaveBuffer(bufferPtr);
  this.freePtr(sizePtr);

  return data.buffer;
}

export function readListItems(module: QspModule, listPtr: Ptr, count: number): QspListItem[] {
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
