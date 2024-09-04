import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('base functions', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('$QSPVER', () => {
    const onVersion = vi.fn();
    api.on('version', onVersion);
    runTestFile(api, `$ver = $QSPVER`);
    expect(onVersion).toHaveBeenCalledWith('', expect.any(Function));
    onVersion.mock.calls[0][1]('5.9.0');

    expect(api.readVariable('$ver')).toBe('5.9.0');
  });

  test('QSPVER platform', () => {
    const onVersion = vi.fn();
    api.on('version', onVersion);
    runTestFile(api, `$ver = $QSPVER('platform')`);
    expect(onVersion).toHaveBeenCalledWith('platform', expect.any(Function));
    onVersion.mock.calls[0][1]('qspider');

    expect(api.readVariable('$ver')).toBe('qspider');
  });

  test('$CURLOC', () => {
    runTestFile(
      api,
      `
gt 'other'
---
#other
$cloc = $CURLOC`,
    );

    expect(api.readVariable('$cloc')).toBe('other');
  });

  describe('MAX', () => {
    test('returning max number', () => {
      runTestFile(api, `res = MAX(1,2,5,2,0)`);
      expect(api.readVariable('res')).toBe(5);
    });
    test('returning max number from variables', () => {
      runTestFile(api, `a = 1 & b = 5 & c = 3 & res = MAX(a,b,c)`);
      expect(api.readVariable('res')).toBe(5);
    });
    test('returning max from array when called with 1 param', () => {
      runTestFile(api, `a[0] = 1 & a[1] = 5 & a[3] = 2 & res = MAX('a')`);
      expect(api.readVariable('res')).toBe(5);
    });
    test('returning max from array with holes', () => {
      runTestFile(api, `a[0] = 1 & a[3] = 5 & a[5] = 2 & res = MAX('a')`);
      expect(api.readVariable('res')).toBe(5);
    });
    test('return lexicographically bigger string', () => {
      runTestFile(api, `$res = MAX('aa','zz','ab')`);
      expect(api.readVariable('$res')).toBe('zz');
    });
    test('return lexicographically bigger string from array', () => {
      runTestFile(api, `$b[0] = 'aa' & $b[1] = 'zz' & $b[2] = 'ab' & $res = MAX('$b')`);
      expect(api.readVariable('$res')).toBe('zz');
    });
    test('return lexicographically bigger string from array with holes', () => {
      runTestFile(api, `$b[0] = 'aa' & $b[3] = 'zz' & $b[5] = 'ab' & $res = MAX('$b')`);
      expect(api.readVariable('$res')).toBe('zz');
    });
    test('return lexicographically bigger string from mixed array', () => {
      runTestFile(api, `$b[0] = 'a' & b[1] = 77 & $b[2] = 'rx' & b[3] = 66 & $b[4] = 'n' & $res = MAX('$b')`);
      expect(api.readVariable('$res')).toBe('rx');
    });
    test('return max from mixed array', () => {
      runTestFile(api, `$b[0] = 'dd' & b[1] = 77 & $b[2] = 'yy' & b[3] = 86 & $b[4] = ' ' & res = MAX('b')`);
      expect(api.readVariable('res')).toBe(86);
    });
    test('ignores numbers when search for string', () => {
      runTestFile(api, `$b[0] = '33' & b[1] = 77 & $b[2] = '44' & b[3] = 66 & $b[4] = '22' & $res = MAX('$b')`);
      expect(api.readVariable('$res')).toBe('44');
    });
    test('ignores strings when search for number', () => {
      runTestFile(api, `$b[0] = '999' & b[1] = 66 & $b[2] = '99' & b[3] = 50 & res = MAX('b')`);
      expect(api.readVariable('res')).toBe(66);
    });
  });

  describe('MIN', () => {
    test('returning min number', () => {
      runTestFile(api, `res = MIN(2,1,5,2)`);
      expect(api.readVariable('res')).toBe(1);
    });
    test('returning min number from variables', () => {
      runTestFile(api, `a = 1 & b = 5 & c = 3 & res = MIN(a,b,c)`);
      expect(api.readVariable('res')).toBe(1);
    });
    test('returning min from array when called with 1 param', () => {
      runTestFile(api, `a[0] = 3 & a[1] = 5 & a[2] = 2 & res = MIN('a')`);
      expect(api.readVariable('res')).toBe(2);
    });
    test('return lexicographically smaller string', () => {
      runTestFile(api, `$res = MIN('aa','zz','ab')`);
      expect(api.readVariable('$res')).toBe('aa');
    });
    test('return lexicographically smaller string from array', () => {
      runTestFile(api, `$b[0] = 'aa' & $b[1] = 'zz' & $b[2] = 'ab' & $res = MIN('$b')`);
      expect(api.readVariable('$res')).toBe('aa');
    });
    test('returning 0 from array with holes', () => {
      runTestFile(api, `a[0] = 1 & a[3] = 5 & a[5] = 2 & res = MIN('a')`);
      expect(api.readVariable('res')).toBe(0);
    });
    test('return empty string from array with holes', () => {
      runTestFile(api, `$b[0] = 'aa' & $b[3] = 'zz' & $b[5] = 'ab' & $res = MIN('$b')`);
      expect(api.readVariable('$res')).toBe('');
    });
    test('return lexicographically smaller string from mixed array', () => {
      runTestFile(api, `$b[0] = 'tt' & b[1] = 77 & $b[2] = 'gg' & b[3] = 66 & $b[4] = 'qq' & $res = MIN('$b')`);
      expect(api.readVariable('$res')).toBe('gg');
    });
    test('return min from mixed array', () => {
      runTestFile(api, `$b[0] = 'a' & b[1] = 86 & $b[2] = 'kk' & b[3] = 77 & $b[4] = '' & res = MIN('b')`);
      expect(api.readVariable('res')).toBe(77);
    });
    test('ignores numbers when search for string', () => {
      runTestFile(api, `$b[0] = '33' & b[1] = 11 & $b[2] = '44' & b[3] = 14 & $b[4] = '22' & $res = MIN('$b')`);
      expect(api.readVariable('$res')).toBe('22');
    });
    test('ignores strings when search for number', () => {
      runTestFile(api, `$b[0] = '9' & b[1] = 66 & $b[2] = '40' & b[3] = 50 & res = MIN('b')`);
      expect(api.readVariable('res')).toBe(50);
    });
  });

  test('RND', () => {
    runTestFile(api, 'res = RND');
    const result = api.readVariable('res');

    expect(result > 0).toBeTruthy();
    expect(result <= 1000).toBeTruthy();
  });

  test('RAND', () => {
    runTestFile(api, 'res = RAND(1, 4)');
    const result = api.readVariable('res');

    expect(result >= 1).toBeTruthy();
    expect(result <= 4).toBeTruthy();
  });

  test('RAND reversed', () => {
    runTestFile(api, 'res = RAND(4, 1)');
    const result = api.readVariable('res');

    expect(result >= 1).toBeTruthy();
    expect(result <= 4).toBeTruthy();
  });

  test('RAND without second param', () => {
    runTestFile(api, 'res = RAND 2');
    const result = api.readVariable('res');

    expect(result >= 1).toBeTruthy();
    expect(result <= 2).toBeTruthy();
  });
});
