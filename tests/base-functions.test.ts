import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('api', () => {
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
    onVersion.mock.calls[0][1]('5.8.0');

    expect(api.readVariable('$ver')).toBe('5.8.0');
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

  describe.each([
    [`res = MAX(1,2,5,2,0)`, 'res', 5],
    [`a = 1 & b = 5 & c = 3 & res = MAX(a,b,c)`, 'res', 5],
    [`$res = MAX('aa','zz','ab')`, '$res', 'zz'],
    [`a[0] = 1 & a[1] = 5 & a[3] = 2 & res = MAX('a')`, 'res', 5],
    [`$b[0] = 'aa' & $b[2] = 'zz' & $b[5] = 'ab' & $res = MAX('$b')`, '$res', 'zz'],
  ])('MAX', (input, variable, result) => {
    test(input, () => {
      runTestFile(api, input);

      expect(api.readVariable(variable)).toBe(result);
    });
  });

  describe.each([
    [`res = MIN(1,2,5,2)`, 'res', 1],
    [`a = 1 & b = 5 & c = 3 & res = MIN(a,b,c)`, 'res', 1],
    [`$res = MIN('aa','zz','ab')`, '$res', 'aa'],
    [`a[0] = 1 & a[1] = 5 & a[2] = 2 & res = MIN('a')`, 'res', 1],
    [`a[0] = 1 & a[1] = 5 & a[5] = 2 & res = MIN('a')`, 'res', 0],
    [`$b[0] = 'aa' & $b[1] = 'zz' & $b[2] = 'ab' & $res = MIN('$b')`, '$res', 'aa'],
    [`$b[0] = 'aa' & $b[2] = 'zz' & $b[5] = 'ab' & $res = MIN('$b')`, '$res', ''],
  ])('MIN', (input, variable, result) => {
    test(input, () => {
      runTestFile(api, input);

      expect(api.readVariable(variable)).toBe(result);
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
