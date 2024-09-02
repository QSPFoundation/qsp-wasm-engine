import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('arrays', () => {
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

  test('overriding string value with number', () => {
    runTestFile(
      api,
      `
$arr[1] = 'test'
arr[1] = 1
  `,
    );
    expect(api.readVariableByIndex('$arr', 1)).toBe('');
    expect(api.readVariableByIndex('arr', 1)).toBe(1);
  });

  test('overriding number value with string', () => {
    runTestFile(
      api,
      `
arr[1] = 1
$arr[1] = 'test'
  `,
    );
    expect(api.readVariableByIndex('$arr', 1)).toBe('test');
    expect(api.readVariableByIndex('arr', 1)).toBe(0);
  });

  test('last element assignment', () => {
    runTestFile(
      api,
      `
$objs[] = 'Напильник'
$objs[] = 'Топор'
$objs[] = 'Доска' 
`,
    );

    expect(api.readVariableByIndex('$objs', 0)).toBe('Напильник');
    expect(api.readVariableByIndex('$objs', 1)).toBe('Топор');
    expect(api.readVariableByIndex('$objs', 2)).toBe('Доска');
  });

  test('last element read', () => {
    runTestFile(
      api,
      `
$objs[] = 'Напильник'
$objs[] = 'Топор'
$objs[] = 'Доска' 
$a = $objs[]
`,
    );

    expect(api.readVariable('$a')).toBe('Доска');
  });

  test('string index', () => {
    runTestFile(api, `любимое_число['Алексей'] = 5 & x = любимое_число['Алексей']`);

    expect(api.readVariableByKey('любимое_число', 'Алексей')).toBe(5);
    expect(api.readVariable('x')).toBe(5);
  });

  test('killvar all variables', () => {
    runTestFile(api, `a = 1 & b = 2`);

    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('b')).toBe(2);
    api.execCode(`killvar`);

    expect(api.readVariable('a')).toBe(0);
    expect(api.readVariable('b')).toBe(0);
  });

  test('killvar whole array', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    api.execCode(`killvar 'a'`);

    expect(api.readVariableByIndex('a', 0)).toBe(0);
    expect(api.readVariableByIndex('a', 1)).toBe(0);
  });

  test('killvar array index', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    api.execCode(`killvar 'a', 1`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(3);
    expect(api.readVariableByIndex('a', 2)).toBe(0);
  });

  test('killvar array key', () => {
    runTestFile(api, `a['test'] = 1 & a['other'] = 2`);

    expect(api.readVariableByKey('a', 'test')).toBe(1);
    expect(api.readVariableByKey('a', 'other')).toBe(2);

    api.execCode(`killvar 'a', 'test'`);

    expect(api.readVariableByKey('a', 'test')).toBe(0);
    expect(api.readVariableByKey('a', 'other')).toBe(2);
  });

  test('killall clears all variables', () => {
    runTestFile(api, `a = 1 & b = 2`);

    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('b')).toBe(2);

    api.execCode(`killall`);

    expect(api.readVariable('a')).toBe(0);
    expect(api.readVariable('b')).toBe(0);
  });

  test('copyarr whole array', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(0);
    expect(api.readVariableByIndex('b', 1)).toBe(0);
    expect(api.readVariableByIndex('b', 2)).toBe(0);

    api.execCode(`copyarr 'b', 'a'`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(1);
    expect(api.readVariableByIndex('b', 1)).toBe(2);
    expect(api.readVariableByIndex('b', 2)).toBe(3);
  });

  test('copyarr with start index', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(0);
    expect(api.readVariableByIndex('b', 1)).toBe(0);
    expect(api.readVariableByIndex('b', 2)).toBe(0);

    api.execCode(`copyarr 'b', 'a', 1`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(2);
    expect(api.readVariableByIndex('b', 1)).toBe(3);
    expect(api.readVariableByIndex('b', 2)).toBe(0);
  });
  test('copyarr with count', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(0);
    expect(api.readVariableByIndex('b', 1)).toBe(0);
    expect(api.readVariableByIndex('b', 2)).toBe(0);

    api.execCode(`copyarr 'b', 'a', 1, 1`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(2);
    expect(api.readVariableByIndex('b', 1)).toBe(0);
    expect(api.readVariableByIndex('b', 2)).toBe(0);
  });

  test('copyarr on number array copies string values', () => {
    runTestFile(api, `a[0] = 1 & $a[1] = 'a' & a[2] = 3`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('$a', 1)).toBe('a');
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(0);
    expect(api.readVariableByIndex('$b', 1)).toBe('');
    expect(api.readVariableByIndex('b', 2)).toBe(0);

    api.execCode(`copyarr 'b', 'a'`);

    expect(api.readVariableByIndex('a', 0)).toBe(1);
    expect(api.readVariableByIndex('$a', 1)).toBe('a');
    expect(api.readVariableByIndex('a', 2)).toBe(3);
    expect(api.readVariableByIndex('b', 0)).toBe(1);
    expect(api.readVariableByIndex('$b', 1)).toBe('a');
    expect(api.readVariableByIndex('b', 2)).toBe(3);
  });

  describe('ARRSIZE', () => {
    test('return array size', () => {
      runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3 & s = arrsize('a')`);

      expect(api.readVariable('s')).toBe(3);
    });

    test('return array size with mixed values', () => {
      runTestFile(api, `a[] = 1 & $a[] = 2 & a[] = 3 & s = arrsize('$a')`);

      expect(api.readVariable('s')).toBe(3);
    });
  });

  describe('ARRPOS', () => {
    test('return index when found', () => {
      runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=4 & r = arrpos('mass',2)`);

      expect(api.readVariable('r')).toBe(1);
    });

    test('return index skiping several elements', () => {
      runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=4 & mass[3]=2 & r = arrpos('mass',2,2)`);

      expect(api.readVariable('r')).toBe(3);
    });

    test('return -1 when not found', () => {
      runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=4 & r = arrpos('mass',10)`);

      expect(api.readVariable('r')).toBe(-1);
    });
  });

  test('arrpos search for 0', () => {
    runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=1 & r = arrpos('mass',0)`);

    expect(api.readVariable('r')).toBe(-1);
  });

  test('arrpos skip', () => {
    runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=1 & r = arrpos('mass',1,1)`);

    expect(api.readVariable('r')).toBe(2);
  });

  test('arrpos string', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='c' & r = arrpos('$mass','b')`);

    expect(api.readVariable('r')).toBe(1);
  });

  test('arrpos string not found', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='c' & r = arrpos('$mass','f')`);

    expect(api.readVariable('r')).toBe(-1);
  });

  test('arrpos string search for empty string', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='c' & r = arrpos('$mass','')`);

    expect(api.readVariable('r')).toBe(-1);
  });

  test('arrpos string skip', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='a' & r = arrpos('$mass','a',1)`);

    expect(api.readVariable('r')).toBe(2);
  });

  test('arrcomp', () => {
    runTestFile(api, `$a[0] = 'a1' & $a[1] = 'b1' & $a[2] = 'c1' & r = arrcomp('$a', 'b\\d')`);

    expect(api.readVariable('r')).toBe(1);
  });

  test('arrcomp not found', () => {
    runTestFile(api, `$a[0] = 'a1' & $a[1] = 'b1' & $a[2] = 'c1' & r = arrcomp('$a', 'f\\d')`);

    expect(api.readVariable('r')).toBe(-1);
  });

  test('arrcomp skip', () => {
    runTestFile(api, `$a[0] = 'a1' & $a[1] = 'b1' & $a[2] = 'a1' & r = arrcomp('$a', 'a\\d', 1)`);

    expect(api.readVariable('r')).toBe(2);
  });

  describe('ARRITEM', () => {
    test('finding element numeric index', () => {
      runTestFile(api, `arr[123]=256 & res = arritem('arr',123)`);

      expect(api.readVariable('res')).toBe(256);
    });

    test('finding element by string index', () => {
      runTestFile(api, `arr['first']=256 & res = arritem('arr','first')`);

      expect(api.readVariable('res')).toBe(256);
    });

    test('finding element by tuple index', () => {
      runTestFile(api, `arr[1,3]=256 & res = arritem('arr', [1,3])`);

      expect(api.readVariable('res')).toBe(256);
    });
  });

  test('negative index', () => {
    runTestFile(api, `arr[0] = 123 & x = arr[-1] & arr[-1] = 234 & y = arr[0]`);

    expect(api.readVariable('x')).toBe(0);
    expect(api.readVariable('y')).toBe(123);
  });

  test('tuple index numbers', () => {
    runTestFile(
      api,
      `
$arr[1,3] = 'test'
$res = $arr[1,3]
    `,
    );

    expect(api.readVariable('$res')).toBe('test');
  });

  test('tuple index strings', () => {
    runTestFile(
      api,
      `
$arr['first','second'] = 'test'
$res = $arr['first','second']
    `,
    );

    expect(api.readVariable('$res')).toBe('test');
  });

  test('tuple index mixed', () => {
    runTestFile(
      api,
      `
$arr['first',2,'sss'] = 'test'
$res = $arr['first',2,'sss']
    `,
    );

    expect(api.readVariable('$res')).toBe('test');
  });
  test('tuple index collision', () => {
    runTestFile(
      api,
      `
$arr[1,3] = 'test'
$arr['1,3'] = 'test1'
$res = $arr[1,3]
    `,
    );

    expect(api.readVariable('$res')).toBe('test');
  });

  describe('ARRCOMP', () => {
    test('finding element by regexp', () => {
      runTestFile(
        api,
        `
          $mass[0] = "топаю вперёд"
          $mass[1] = " иду в пещеру"
          $mass[2] = "не иду в пещеру"
          $mass[3] = "топаю к дому"
          res = arrcomp('$mass', '\\s?\\S+\\s\\S+\\s\\S+\\s?')
        `,
      );

      expect(api.readVariable('res')).toBe(1);
    });

    test('finding element by regexp with skip', () => {
      runTestFile(
        api,
        `
          $mass[0] = "топаю вперёд"
          $mass[1] = " иду в пещеру"
          $mass[2] = "не иду в пещеру"
          $mass[3] = "топаю к дому"
          res = arrcomp('$mass', '\\s?\\S+\\s\\S+\\s\\S+\\s?', 2)
        `,
      );

      expect(api.readVariable('res')).toBe(3);
    });

    test('return -1 when not found', () => {
      runTestFile(api, `res = arrcomp('$mass', 'ab')`);

      expect(api.readVariable('res')).toBe(-1);
    });
  });
});
