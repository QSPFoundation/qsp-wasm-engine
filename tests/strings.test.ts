import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('strings', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  describe.each([
    [`'ac' = 'ac'`, 1],
    [`'ac' = 'ab'`, 0],
    [`'bc' > 'ac'`, 1],
    [`'ac' > 'ab'`, 1],
    [`'b'  > 'ab'`, 1],
    [`'ab' > 'a'`, 1],
  ])('string compare', (input, result) => {
    test(input, () => {
      runTestFile(api, `res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('res')).toBe(result);
    });
  });

  test('subexpression', () => {
    runTestFile(api, `i = 1 & $res = 'i=<<i>>'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$res')).toBe('i=1');
  });

  test('nested subexpressions', () => {
    runTestFile(api, `i = 1 & $a['_1'] = 'here' & $res = 's=<<$a["_<<i>>"]>>'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$res')).toBe('s=here');
  });

  test('LEN', () => {
    runTestFile(api, 'res = LEN("тест")');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(4);
  });

  describe.each([
    [`$MID('abcd', 1, 2)`, 'ab'],
    [`$MID('abcd', 2, 3)`, 'bcd'],
    [`$MID('abcd', 2)`, 'bcd'],
  ])('MID', (input, result) => {
    test(input, () => {
      runTestFile(api, `$res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('$res')).toBe(result);
    });
  });

  test('UCASE', () => {
    runTestFile(api, `$res = $UCASE('TexT#')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$res')).toBe('TEXT#');
  });

  test('LCASE', () => {
    runTestFile(api, `$res = $LCASE('TexT#')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$res')).toBe('text#');
  });

  test('TRIM', () => {
    runTestFile(api, `$res = $TRIM(' TRIM TEST ')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$res')).toBe('TRIM TEST');
  });

  describe.each([
    [`$REPLACE('test', '12', '4')`, 'test'],
    [`$REPLACE('test', 'e', 's')`, 'tsst'],
    [`$REPLACE('test', 't', '34')`, '34es34'],
    [`$REPLACE('test', 't')`, 'es'],
  ])('REPLACE', (input, result) => {
    test(input, () => {
      runTestFile(api, `$res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('$res')).toBe(result);
    });
  });

  describe.each([
    [`INSTR('ABCDefgh','BC',1)`, 2],
    [`INSTR('ABCDefgh','Be',1)`, 0],
    [`INSTR('abcdef','abc')`, 1],
  ])('INSTR', (input, result) => {
    test(input, () => {
      runTestFile(api, `res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe.each([
    [`ISNUM('9999')`, 1],
    [`ISNUM(' 9999 ')`, 1],
    [`ISNUM(' -888')`, 1],
    [`ISNUM('777a6')`, 0],
    [`ISNUM('')`, 0],
  ])('ISNUM', (input, result) => {
    test(input, () => {
      runTestFile(api, `res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('res')).toBe(result);
    });
  });

  test('VAL', () => {
    runTestFile(api, `res = VAL('123')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(123);
  });

  test('STR', () => {
    runTestFile(api, `$res = STR(123)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$res')).toBe('123');
  });

  describe.each([
    [`STRFIND(' идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 0)`, ''],
    [`STRFIND('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 1)`, 'идти'],
    [`STRFIND('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 2)`, 'к'],
    [`STRFIND('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 3)`, 'пещере'],
    [`STRFIND('идти к дому', 'к\\s(\\S+)', 0)`, 'к дому'],
    [`STRFIND('идти к дому', 'к\\s(\\S+)')`, 'к дому'],
    [`STRFIND('идти к дому', 'к\\s(\\S+)', 1)`, 'дому'],
    [`STRFIND('идти к своему дому', 'к\\s(\\S+)', 1)`, 'своему'],
  ])('STRFIND', (input, result) => {
    test(input, () => {
      runTestFile(api, `$res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('$res')).toBe(result);
    });
  });

  describe.each([
    [`STRCOMP(' идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$')`, 0],
    [`STRCOMP('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$')`, 1],
  ])('STRCOMP', (input, result) => {
    test(input, () => {
      runTestFile(api, `res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe.each([
    [`STRPOS(' идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 0)`, 0],
    [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 1)`, 1],
    [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 2)`, 6],
    [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 3)`, 8],
    [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)(\\s(\\S+))?$', 4)`, 8],
    [`STRPOS('идти к дому', 'к\\s(\\S+)', 0)`, 6],
    [`STRPOS('идти к дому', 'к\\s(\\S+)')`, 6],
    [`STRPOS('идти к дому', 'к\\s(\\S+)', 1)`, 8],
    [`STRPOS('идти к своему дому', 'к\\s(\\S+)', 1)`, 8],
  ])('STRPOS', (input, result) => {
    test(input, () => {
      runTestFile(api, `res = ${input}`);
      expect(error).not.toHaveBeenCalled();
      expect(api.readVariable('res')).toBe(result);
    });
  });
});
