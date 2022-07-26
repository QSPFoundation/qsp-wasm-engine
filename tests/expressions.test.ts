import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('acts', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('unary minus', () => {
    runTestFile(api, 'x = 5 & y = -x');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(-5);
  });

  test('non equality', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x = y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(0);
  });

  test('equality', () => {
    runTestFile(api, 'x = 5 & y = 5 & res = x = y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('lt', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x < y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('gt', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x > y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(0);
  });

  test('!', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x ! y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('<>', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x <> y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('<=', () => {
    runTestFile(api, 'x = 6 & y = 6 & res = x <= y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('>=', () => {
    runTestFile(api, 'x = 6 & y = 6 & res = x >= y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('OR', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x OR y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('AND', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x AND y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('AND', () => {
    runTestFile(api, 'x = 5 & y = 0 & res = x AND y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(0);
  });

  test('NO', () => {
    runTestFile(api, 'x = 5 & res = NO x');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(0);
  });

  test('NO', () => {
    runTestFile(api, 'x = 0 & res = NO x');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('MOD', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = y MOD x');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('+', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x + y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(11);
  });

  test('-', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x - y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(-1);
  });

  test('*', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x * y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(30);
  });

  test('/', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x / y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(0);
  });

  test('+=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x += y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(11);
  });

  test('-=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x -= y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(-1);
  });

  test('*=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x *= y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(30);
  });

  test('/=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x /= y');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(0);
  });

  test('priorities', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x*y + y*-x/2');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(15);
  });

  test('priorities', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = 15*5/2');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(37);
  });

  test('priorities', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = 15/2*5');
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(35);
  });

  test('OBJ', () => {
    runTestFile(api, `res = OBJ 'test'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(0);
  });

  test('OBJ', () => {
    runTestFile(api, `ADDOBJ 'test' & res = OBJ 'test'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('LOC', () => {
    runTestFile(api, `res = LOC 'test'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(1);
  });

  test('LOC', () => {
    runTestFile(api, `res = LOC 'missing'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('res')).toBe(0);
  });
});
