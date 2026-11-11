import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI, QspTuple } from '../../src/contracts/api';

describe('records: tuples with named fields', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  it('reads the field names with the tuple', async () => {
    await runTestFile(api, `%r = [hp: 10, 'sword', mp: 3]`);

    const r = api.readVariable('%r') as QspTuple;
    expect([...r]).toEqual([10, 'sword', 3]);
    expect(r.names).toEqual(['HP', undefined, 'MP']);
  });

  it('has no names property for a plain tuple', async () => {
    await runTestFile(api, `%t = [1, 'a']`);

    const t = api.readVariable('%t') as QspTuple;
    expect([...t]).toEqual([1, 'a']);
    expect(t.names).toBeUndefined();
  });

  it('reads nested records', async () => {
    await runTestFile(api, `%r = [pos: [x: 1, y: 2], 'tag']`);

    const r = api.readVariable('%r') as QspTuple;
    expect(r.names).toEqual(['POS', undefined]);
    const pos = r[0] as QspTuple;
    expect([...pos]).toEqual([1, 2]);
    expect(pos.names).toEqual(['X', 'Y']);
  });

  it('reads a field written through the dot syntax', async () => {
    await runTestFile(api, `%r = [hp: 10] & r.hp = 42 & r.mp = 7`);

    const r = api.readVariable('%r') as QspTuple;
    expect([...r]).toEqual([42, 7]);
    expect(r.names).toEqual(['HP', 'MP']);
  });

  it('finds an item by a key with names, distinct from the unnamed key', async () => {
    await runTestFile(api, `test[[hp: 1]] = 254 & test[[1]] = 11`);

    const key: QspTuple = [1];
    key.names = ['hp'];
    expect(api.readVariableByKey('test', key)).toBe(254);
    expect(api.readVariableIndexByKey('test', key)).toBe(0);
    expect(api.readVariableByKey('test', [1])).toBe(11);
    expect(api.readVariableIndexByKey('test', [1])).toBe(1);
  });

  it('a key with a name the game never used finds nothing', async () => {
    await runTestFile(api, `test[[hp: 1]] = 254`);

    const key: QspTuple = [1];
    key.names = ['unknownname'];
    expect(api.readVariableIndexByKey('test', key)).toBe(-1);
  });

  it('returns the key with its names from readVariableItem', async () => {
    await runTestFile(api, `test[[hp: 1, 'x']] = 254`);

    const item = api.readVariableItem('test', 0);
    expect(item.value).toBe(254);
    const key = item.key as QspTuple;
    expect([...key]).toEqual([1, 'x']);
    expect(key.names).toEqual(['HP', undefined]);
  });

  it('reads variables by a name in any case, with spaces around it', async () => {
    await runTestFile(api, `test = 5 & $name = 'abc'`);

    expect(api.readVariable('TEST')).toBe(5);
    expect(api.readVariable('Test')).toBe(5);
    expect(api.readVariable(' test ')).toBe(5);
    expect(api.readVariable('$Name')).toBe('abc');
    expect(api.readVariableSize('TeSt')).toBe(1);
  });
});
