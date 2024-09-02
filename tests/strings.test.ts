import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('strings', () => {
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

  describe('string compare', () => {
    test.each([
      [`'ac' = 'ac'`, 1],
      [`'ac' = 'ab'`, 0],
      [`'bc' > 'ac'`, 1],
      [`'ac' > 'ab'`, 1],
      [`'b'  > 'ab'`, 1],
      [`'ab' > 'a'`, 1],
    ])('%s -> %i', (input, result) => {
      runTestFile(api, `res = ${input}`);

      expect(api.readVariable('res')).toBe(result);
    });
  });

  test('subexpression', () => {
    runTestFile(api, `i = 1 & $res = 'i=<<i>>'`);

    expect(api.readVariable('$res')).toBe('i=1');
  });

  test('nested subexpressions', () => {
    runTestFile(api, `i = 1 & $a['_1'] = 'here' & $res = 's=<<$a["_<<i>>"]>>'`);

    expect(api.readVariable('$res')).toBe('s=here');
  });

  test('LEN', () => {
    runTestFile(api, 'res = LEN("тест")');

    expect(api.readVariable('res')).toBe(4);
  });

  describe('$MID', () => {
    test('cutting string from middle', () => {
      runTestFile(api, `$res = $MID('abcd', 2, 2)`);
      expect(api.readVariable('$res')).toBe('bc');
    });

    test('cutting string from end', () => {
      runTestFile(api, `$res = $MID('abcd', 3)`);
      expect(api.readVariable('$res')).toBe('cd');
    });

    test('cutting string from start', () => {
      runTestFile(api, `$res = $MID('abcd', 0, 2)`);
      expect(api.readVariable('$res')).toBe('ab');
    });

    test('returns empty string if index bigger string start', () => {
      runTestFile(api, `$res = $MID('abcd', 5, 2)`);
      expect(api.readVariable('$res')).toBe('');
    });
  });

  test('UCASE', () => {
    runTestFile(api, `$res = $UCASE('TexT#')`);

    expect(api.readVariable('$res')).toBe('TEXT#');
  });

  test('UCASE cyrilic', () => {
    runTestFile(api, `$res = $UCASE('Привет, Алиса!')`);

    expect(api.readVariable('$res')).toBe('ПРИВЕТ, АЛИСА!');
  });

  test('LCASE', () => {
    runTestFile(api, `$res = $LCASE('TexT#')`);

    expect(api.readVariable('$res')).toBe('text#');
  });

  test('LCASE cyrilic', () => {
    runTestFile(api, `$res =$lcase('Привет, Алиса!')`);

    expect(api.readVariable('$res')).toBe('привет, алиса!');
  });

  test('TRIM', () => {
    runTestFile(api, `$res = $TRIM(' TRIM TEST ')`);

    expect(api.readVariable('$res')).toBe('TRIM TEST');
  });

  describe('$REPLACE', () => {
    test('replaces string', () => {
      runTestFile(api, `$res = $REPLACE('test', 'e', 's')`);
      expect(api.readVariable('$res')).toBe('tsst');
    });

    test('replaces all occurrences', () => {
      runTestFile(api, `$res = $REPLACE('test', 't', '34')`);
      expect(api.readVariable('$res')).toBe('34es34');
    });

    test('returns initial string if replacement not found', () => {
      runTestFile(api, `$res = $REPLACE('test', '1', '2')`);
      expect(api.readVariable('$res')).toBe('test');
    });

    test('removes occurences if last parm not provided', () => {
      runTestFile(api, `$res = $REPLACE('test', 't')`);
      expect(api.readVariable('$res')).toBe('es');
    });

    test('works with cyrilic', () => {
      runTestFile(api, `$res = $REPLACE('Привет, Алиса!', 'Алиса', 'Катя')`);
      expect(api.readVariable('$res')).toBe('Привет, Катя!');
    });
  });

  describe('INSTR', () => {
    test.each([
      [`INSTR('ABCDefgh','BC',1)`, 2],
      [`INSTR('ABCDefgh','Be',1)`, 0],
      [`INSTR('abcdef','abc')`, 1],
      [`INSTR('abcdef','abd')`, 0],
    ])('%s -> %i', (input, result) => {
      runTestFile(api, `res = ${input}`);

      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('ISNUM', () => {
    test.each([
      [`9999`, 1],
      [` 9999 `, 1],
      [` -888`, 1],
      [`777a6`, 0],
      [``, 0],
    ])('ISNUM("%s") -> %i', (input, result) => {
      runTestFile(api, `res = ISNUM("${input}")`);

      expect(api.readVariable('res')).toBe(result);
    });
  });

  test('VAL with number in string', () => {
    runTestFile(api, `res = VAL('123')`);

    expect(api.readVariable('res')).toBe(123);
  });

  test('VAL with mised string', () => {
    runTestFile(api, `res = VAL('123a')`);

    expect(api.readVariable('res')).toBe(0);
  });

  test('VAL with empty string', () => {
    runTestFile(api, `res = VAL('')`);

    expect(api.readVariable('res')).toBe(0);
  });

  test('STR', () => {
    runTestFile(api, `$res = STR(123)`);

    expect(api.readVariable('$res')).toBe('123');
  });

  describe('STRFIND', () => {
    test.each([
      [`STRFIND(' идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 0)`, ''],
      [`STRFIND('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 1)`, 'идти'],
      [`STRFIND('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 2)`, 'к'],
      [`STRFIND('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 3)`, 'пещере'],
      [`STRFIND('идти к дому', 'к\\s(\\S+)', 0)`, 'к дому'],
      [`STRFIND('идти к дому', 'к\\s(\\S+)')`, 'к дому'],
      [`STRFIND('идти к дому', 'к\\s(\\S+)', 1)`, 'дому'],
      [`STRFIND('идти к своему дому', 'к\\s(\\S+)', 1)`, 'своему'],
    ])('%s -> %s', (input, result) => {
      runTestFile(api, `$res = ${input}`);

      expect(api.readVariable('$res')).toBe(result);
    });
  });

  describe('STRCOMP', () => {
    test.each([
      [`STRCOMP(' идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$')`, 0],
      [`STRCOMP('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$')`, 1],
    ])('%s -> %i', (input, result) => {
      runTestFile(api, `res = ${input}`);

      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('STRPOS', () => {
    test.each([
      [`STRPOS(' идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 0)`, 0],
      [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 1)`, 1],
      [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 2)`, 6],
      [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)\\s(\\S+)$', 3)`, 8],
      [`STRPOS('идти к пещере', '^(\\S+)\\s(\\S+)(\\s(\\S+))?$', 4)`, 8],
      [`STRPOS('идти к дому', 'к\\s(\\S+)', 0)`, 6],
      [`STRPOS('идти к дому', 'к\\s(\\S+)')`, 6],
      [`STRPOS('идти к дому', 'к\\s(\\S+)', 1)`, 8],
      [`STRPOS('идти к своему дому', 'к\\s(\\S+)', 1)`, 8],
    ])('%s -> %i', (input, result) => {
      runTestFile(api, `res = ${input}`);

      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('SCANSTR', () => {
    test('extracting tokens from string', () => {
      runTestFile(api, `scanstr '$s', 'ffff|bbbb|ccccc', '[^|]+'`);

      expect(api.readVariableByIndex('$s', 0)).toBe('ffff');
      expect(api.readVariableByIndex('$s', 1)).toBe('bbbb');
      expect(api.readVariableByIndex('$s', 2)).toBe('ccccc');
    })
  })
});
