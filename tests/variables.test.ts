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
y, x  = x, y`
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(2);
    expect(api.readVariable('y')).toBe(1);
  });
});
