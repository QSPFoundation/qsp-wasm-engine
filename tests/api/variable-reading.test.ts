import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('API variable reading with QSP features', () => {
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

  it('should read numeric variable', async () => {
    runTestFile(api, `test = 254`);

    expect(api.readVariable('test')).toBe(254);
  });
  it('should read numeric variable by index', async () => {
    runTestFile(api, `test[2] = 254`);

    expect(api.readVariableByIndex('test', 2)).toBe(254);
  });
  it('should read numeric variable by key', () => {
    runTestFile(api, `test[0] = 11 & test['test'] = 254`);

    expect(api.readVariableByKey('test', 'test')).toBe(254);
  });

  it('should read numeric variable by cyrillic key', () => {
    runTestFile(api, `test[0] = 11 & test['тест'] = 254`);

    expect(api.readVariableByKey('test', 'тест')).toBe(254);
  });

  it('should read numeric variable in cyrillic', async () => {
    runTestFile(api, `тест = 254`);

    expect(api.readVariable('тест')).toBe(254);
  });

  it('should read string variable', async () => {
    runTestFile(api, `$test = '254'`);

    expect(api.readVariable('$test')).toBe('254');
  });
  it('should read string variable by index', async () => {
    runTestFile(api, `$test[2] = '254'`);

    expect(api.readVariableByIndex('$test', 2)).toBe('254');
  });

  it('should read string variable by key', async () => {
    runTestFile(api, `$test['s'] = '254' & $test['test'] = '252'`);

    expect(api.readVariableByKey('$test', 'test')).toBe('252');
  });

  it('should read string variable by cyrillic key', async () => {
    runTestFile(api, `$test['dd'] = '254' & $test['тест'] = '252'`);

    expect(api.readVariableByKey('$test', 'тест')).toBe('252');
  });

  it('should read string variable in cyrillic', async () => {
    runTestFile(api, `$тест = '254'`);

    expect(api.readVariable('$тест')).toBe('254');
  });

  it('should read tuple variable', () => {
    runTestFile(api, `%test = ['a', 'b']`);

    expect(api.readVariable('%test')).toEqual(['a', 'b']);
  });

  it('should read tuple variable by index', () => {
    runTestFile(api, `%test[1] = ['b']`);

    expect(api.readVariableByIndex('%test', 1)).toEqual(['b']);
  });

  it('should read tuple variable by key', () => {
    runTestFile(api, `%test['s'] = ['b']`);

    expect(api.readVariableByKey('%test', 's')).toEqual(['b']);
  });

  it('should read variable size', () => {
    runTestFile(api, `test[100] = 1`);

    expect(api.readVariableSize('test')).toBe(101);
  });

  describe('type prefix', () => {
    it('should read stored value as is without prefix', () => {
      runTestFile(api, `$test[0] = 'abc' & test[1] = 254 & %test[2] = [1, 'a']`);

      expect(api.readVariableByIndex('test', 0)).toBe('abc');
      expect(api.readVariableByIndex('test', 1)).toBe(254);
      expect(api.readVariableByIndex('test', 2)).toEqual([1, 'a']);
    });

    it('should return undefined for missing values without prefix', () => {
      runTestFile(api, `test[2] = 1`);

      expect(api.readVariable('missing')).toBeUndefined();
      expect(api.readVariableByIndex('test', 0)).toBeUndefined();
      expect(api.readVariableByIndex('test', 5)).toBeUndefined();
    });

    it('should convert value to the prefix type', () => {
      runTestFile(api, `test = 254 & $str = 'abc'`);

      expect(api.readVariable('#test')).toBe(254);
      expect(api.readVariable('$test')).toBe('');
      expect(api.readVariable('%test')).toEqual([]);
      expect(api.readVariable('#str')).toBe(0);
      expect(api.readVariable('$str')).toBe('abc');
    });

    it('should return empty values of the prefix type for missing values', () => {
      runTestFile(api, ``);

      expect(api.readVariable('#missing')).toBe(0);
      expect(api.readVariable('$missing')).toBe('');
      expect(api.readVariable('%missing')).toEqual([]);
    });
  });

  describe('keys', () => {
    it('should read variable by tuple key', () => {
      runTestFile(api, `test[1, 'a'] = 254`);

      expect(api.readVariableByKey('test', [1, 'a'])).toBe(254);
    });

    it('should read variable by numeric key as position', () => {
      runTestFile(api, `test[3] = 254`);

      expect(api.readVariableByKey('test', 3)).toBe(254);
    });

    it('should return undefined for missing key', () => {
      runTestFile(api, `test['a'] = 254`);

      expect(api.readVariableByKey('test', 'b')).toBeUndefined();
    });

    it('should read index by key', () => {
      runTestFile(api, `test['a'] = 1 & test[1, 2] = 2 & test[5] = 3`);

      expect(api.readVariableIndexByKey('test', 'a')).toBe(0);
      expect(api.readVariableIndexByKey('test', [1, 2])).toBe(1);
      expect(api.readVariableIndexByKey('test', 5)).toBe(5);
      expect(api.readVariableIndexByKey('test', 'missing')).toBe(-1);
      expect(api.readVariableIndexByKey('test', 9)).toBe(-1);
      expect(api.readVariableIndexByKey('missing', 'a')).toBe(-1);
    });

    it('should read item with its key', () => {
      runTestFile(api, `$test['a'] = 'first' & test[1, 2] = 2 & test[5] = 3`);

      expect(api.readVariableItem('test', 0)).toEqual({ value: 'first', key: 'a' });
      expect(api.readVariableItem('test', 1)).toEqual({ value: 2, key: [1, 2] });
      expect(api.readVariableItem('test', 5)).toEqual({ value: 3, key: undefined });
      expect(api.readVariableItem('test', 9)).toEqual({ value: undefined, key: undefined });
    });

    it('should read item value with the prefix type', () => {
      runTestFile(api, `test['a'] = 254`);

      expect(api.readVariableItem('$test', 0)).toEqual({ value: '', key: 'a' });
    });
  });

  describe('cache', () => {
    let reads: number;
    beforeEach(() => {
      reads = 0;
      const module = (api as unknown as { module: { _QSPGetVarValue: (...args: number[]) => number } })
        .module;
      const original = module._QSPGetVarValue;
      module._QSPGetVarValue = (...args) => {
        ++reads;
        return original(...args);
      };
    });

    it('should read the engine once for repeated cached reads', async () => {
      await runTestFile(api, `n = 1 & $s = 'a' & a[0] = 5 & a['k'] = 7`);
      reads = 0;

      for (let i = 0; i < 3; ++i) {
        expect(api.readVariable('n', true)).toBe(1);
        expect(api.readVariable('$s', true)).toBe('a');
        expect(api.readVariableByIndex('a', 0, true)).toBe(5);
        expect(api.readVariableByKey('a', 'k', true)).toBe(7);
      }
      expect(reads).toBe(4); // one read of the engine per variable
    });

    it('should not cache without useCache', async () => {
      await runTestFile(api, `n = 1`);
      reads = 0;

      api.readVariable('n');
      api.readVariable('n');
      expect(reads).toBe(2);
    });

    it('should not return stale values after the engine ran code', async () => {
      await runTestFile(api, `n = 1`);
      expect(api.readVariable('n', true)).toBe(1);

      await api.execCode('n = 2');
      expect(api.readVariable('n', true)).toBe(2);
    });

    it('should not return stale values inside and after a blocking event', async () => {
      const seen: unknown[] = [];
      api.on('msg', (_text, resolve) => {
        seen.push(api.readVariable('n', true));
        resolve();
      });
      await runTestFile(api, `n = 1`);
      expect(api.readVariable('n', true)).toBe(1);

      await api.execCode(`n = 2 & msg 'a' & n = 3 & msg 'b' & n = 4`);
      expect(seen).toEqual([2, 3]);
      expect(api.readVariable('n', true)).toBe(4);
    });

    it('should drop the values with clearCache', async () => {
      await runTestFile(api, `n = 1`);
      api.readVariable('n', true);
      reads = 0;

      api.clearCache();
      api.readVariable('n', true);
      expect(reads).toBe(1);
    });

    it('should share one read between the watchers of a variable', async () => {
      await runTestFile(api, `n = 1`);
      const first = vi.fn();
      const second = vi.fn();
      api.watchVariable('n', first);
      api.watchVariable('n', second);
      reads = 0;

      await api.execCode('n = 2');
      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(first).toHaveBeenLastCalledWith(2);
      expect(second).toHaveBeenLastCalledWith(2);
      expect(reads).toBe(1);
    });
  });
});
