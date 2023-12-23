import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('stats panel', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('default number value', () => {
    expect(api.readVariable('not_defined')).toBe(0);
  });

  test('default string value', () => {
    expect(api.readVariable('$not_defined')).toBe('');
  });

  test('variables are case insensitive', () => {
    runTestFile(api, `money = 100 & MONEY += 1`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('MoNeY')).toBe(101);
  });

  test('LET assignment', () => {
    runTestFile(api, `LET money = 100`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('money')).toBe(100);
  });

  test('SET assignment', () => {
    runTestFile(api, `SET money = 100`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('money')).toBe(100);
  });

  test('assignment', () => {
    runTestFile(api, `money = 100`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('money')).toBe(100);
  });

  test('multi assignmet', () => {
    runTestFile(api, `a, $b, $c, d = 1, 'test', 'other', 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('$b')).toBe('test');
    expect(api.readVariable('$c')).toBe('other');
    expect(api.readVariable('d')).toBe(2);
  });

  test('variable swap', () => {
    runTestFile(
      api,
      `
x = 1
y = 2
y, x  = x, y`,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(2);
    expect(api.readVariable('y')).toBe(1);
  });

  test('local', () => {
    runTestFile(
      api,
      `
a = 1 & b = 2 & c = 3 & d = 4 & e = 5 & f = 6
gs 'other'
---
# other
local a,b,c,d,e,f = 11,12,13,14,15,16
la = a
lb = b
lc = c
ld = d
le = e
lf = f
    `,
    );

    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('la')).toBe(11);
    expect(api.readVariable('b')).toBe(2);
    expect(api.readVariable('lb')).toBe(12);
    expect(api.readVariable('c')).toBe(3);
    expect(api.readVariable('lc')).toBe(13);
    expect(api.readVariable('d')).toBe(4);
    expect(api.readVariable('ld')).toBe(14);
    expect(api.readVariable('e')).toBe(5);
    expect(api.readVariable('le')).toBe(15);
    expect(api.readVariable('f')).toBe(6);
    expect(api.readVariable('lf')).toBe(16);
  });

  test('local variables in nested calls', () => {
    runTestFile(
      api,
      `
a = 1
gs 'other'
--- 
# other
local a = 2
la = a
gs 'nested'
---
# nested
na = a
`,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('la')).toBe(2);
    expect(api.readVariable('na')).toBe(2);
  });

  test('local reset on subsequent calls', () => {
    runTestFile(
      api,
      `
gs 'other', 'first', 1
gs 'other', 'second', 2
---
# other
local a
a[] = args[1]
size[$args[0]] = arrsize('a')
res[$args[0]] = a[0]
`,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('res', 'first')).toBe(1);
    expect(api.readVariableByKey('res', 'second')).toBe(2);
    expect(api.readVariableByKey('size', 'first')).toBe(1);
    expect(api.readVariableByKey('size', 'second')).toBe(1);
  });
});
