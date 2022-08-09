import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('api', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('overriding string value with number', () => {
    runTestFile(
      api,
      `
$arr[1] = 'test'
arr[1] = 1
  `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$arr', 1)).toBe('');
    expect(api.readVariable('arr', 1)).toBe(1);
  });

  test('overriding number value with string', () => {
    runTestFile(
      api,
      `
arr[1] = 1
$arr[1] = 'test'
  `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$arr', 1)).toBe('test');
    expect(api.readVariable('arr', 1)).toBe(0);
  });

  test('last element assignment', () => {
    runTestFile(
      api,
      `
$objs[] = 'Напильник'
$objs[] = 'Топор'
$objs[] = 'Доска' 
`
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$objs', 0)).toBe('Напильник');
    expect(api.readVariable('$objs', 1)).toBe('Топор');
    expect(api.readVariable('$objs', 2)).toBe('Доска');
  });

  test('last element read', () => {
    runTestFile(
      api,
      `
$objs[] = 'Напильник'
$objs[] = 'Топор'
$objs[] = 'Доска' 
$a = $objs[]
`
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$a')).toBe('Доска');
  });

  test('string index', () => {
    runTestFile(api, `любимое_число['Алексей'] = 5 & x = любимое_число['Алексей']`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('любимое_число', 'Алексей')).toBe(5);
    expect(api.readVariable('x')).toBe(5);
  });

  test('killvar all variables', () => {
    runTestFile(api, `a = 1 & b = 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('b')).toBe(2);
    api.execCode(`killvar`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a')).toBe(0);
    expect(api.readVariable('b')).toBe(0);
  });

  test('killvar whole array', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    api.execCode(`killvar 'a'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(0);
    expect(api.readVariable('a', 1)).toBe(0);
  });

  test('killvar array index', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    expect(api.readVariable('a', 2)).toBe(3);
    api.execCode(`killvar 'a', 1`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(3);
    expect(api.readVariable('a', 2)).toBe(0);
  });

  test('killvar array key', () => {
    runTestFile(api, `a['test'] = 1 & a['other'] = 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('a', 'test')).toBe(1);
    expect(api.readVariableByKey('a', 'other')).toBe(2);
    api.execCode(`killvar 'a', 'test'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('a', 'test')).toBe(0);
    expect(api.readVariableByKey('a', 'other')).toBe(2);
  });

  test('copyarr whole array', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    expect(api.readVariable('a', 2)).toBe(3);
    expect(api.readVariable('b', 0)).toBe(0);
    expect(api.readVariable('b', 1)).toBe(0);
    expect(api.readVariable('b', 2)).toBe(0);
    api.execCode(`copyarr 'b', 'a'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    expect(api.readVariable('a', 2)).toBe(3);
    expect(api.readVariable('b', 0)).toBe(1);
    expect(api.readVariable('b', 1)).toBe(2);
    expect(api.readVariable('b', 2)).toBe(3);
  });

  test('copyarr with start index', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    expect(api.readVariable('a', 2)).toBe(3);
    expect(api.readVariable('b', 0)).toBe(0);
    expect(api.readVariable('b', 1)).toBe(0);
    expect(api.readVariable('b', 2)).toBe(0);
    api.execCode(`copyarr 'b', 'a', 1`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    expect(api.readVariable('a', 2)).toBe(3);
    expect(api.readVariable('b', 0)).toBe(2);
    expect(api.readVariable('b', 1)).toBe(3);
    expect(api.readVariable('b', 2)).toBe(0);
  });
  test('copyarr with count', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    expect(api.readVariable('a', 2)).toBe(3);
    expect(api.readVariable('b', 0)).toBe(0);
    expect(api.readVariable('b', 1)).toBe(0);
    expect(api.readVariable('b', 2)).toBe(0);
    api.execCode(`copyarr 'b', 'a', 1, 1`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a', 0)).toBe(1);
    expect(api.readVariable('a', 1)).toBe(2);
    expect(api.readVariable('a', 2)).toBe(3);
    expect(api.readVariable('b', 0)).toBe(2);
    expect(api.readVariable('b', 1)).toBe(0);
    expect(api.readVariable('b', 2)).toBe(0);
  });

  test('arrsize', () => {
    runTestFile(api, `a[0] = 1 & a[1] = 2 & a[2] = 3 & s = arrsize('a')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('s')).toBe(3);
  });

  test('arrsize mixed values', () => {
    runTestFile(api, `a[] = 1 & $a[] = 2 & a[] = 3 & s = arrsize('$a')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('s')).toBe(3);
  });

  test('arrpos', () => {
    runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=4 & r = arrpos('mass',2)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(1);
  });

  test('arrpos not found', () => {
    runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=4 & r = arrpos('mass',10)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(-1);
  });

  test('arrpos search for 0', () => {
    runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=1 & r = arrpos('mass',0)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(3);
  });

  test('arrpos skip', () => {
    runTestFile(api, `mass[0]=1 & mass[1]=2 & mass[2]=1 & r = arrpos('mass',1,1)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(2);
  });

  test('arrpos string', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='c' & r = arrpos('$mass','b')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(1);
  });

  test('arrpos string not found', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='c' & r = arrpos('$mass','f')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(-1);
  });

  test('arrpos string search for empty string', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='c' & r = arrpos('$mass','')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(3);
  });

  test('arrpos string skip', () => {
    runTestFile(api, `$mass[0]='a' & $mass[1]='b' & $mass[2]='a' & r = arrpos('$mass','a',1)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(2);
  });

  test('arrcomp', () => {
    runTestFile(api, `$a[0] = 'a1' & $a[1] = 'b1' & $a[2] = 'c1' & r = arrcomp('$a', 'b\\d')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(1);
  });

  test('arrcomp not found', () => {
    runTestFile(api, `$a[0] = 'a1' & $a[1] = 'b1' & $a[2] = 'c1' & r = arrcomp('$a', 'f\\d')`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(-1);
  });

  test('arrcomp skip', () => {
    runTestFile(api, `$a[0] = 'a1' & $a[1] = 'b1' & $a[2] = 'a1' & r = arrcomp('$a', 'a\\d', 1)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(2);
  });

  test('arritem', () => {
    runTestFile(api, `arr[123]=256 & r = arritem('arr',123)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('r')).toBe(256);
  });

  test('negative index', () => {
    runTestFile(api, `arr[0] = 123 & x = arr[-1] & arr[-1] = 234 & y = arr[0]`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(0);
    expect(api.readVariable('y')).toBe(123);
  });
});
