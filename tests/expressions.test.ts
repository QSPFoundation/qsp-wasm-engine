import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('acts', () => {
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

  test('unary minus', () => {
    runTestFile(api, 'x = 5 & y = -x');

    expect(api.readVariable('y')).toBe(-5);
  });

  test('non equality', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x = y');

    expect(api.readVariable('res')).toBe(0);
  });

  test('equality', () => {
    runTestFile(api, 'x = 5 & y = 5 & res = x = y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('lt', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x < y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('gt', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x > y');

    expect(api.readVariable('res')).toBe(0);
  });

  test('!', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x ! y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('<>', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x <> y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('<=', () => {
    runTestFile(api, 'x = 6 & y = 6 & res = x <= y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('>=', () => {
    runTestFile(api, 'x = 6 & y = 6 & res = x >= y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('OR', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x OR y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('AND', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x AND y');

    expect(api.readVariable('res')).toBe(1);
  });

  test('AND', () => {
    runTestFile(api, 'x = 5 & y = 0 & res = x AND y');

    expect(api.readVariable('res')).toBe(0);
  });

  test('NO', () => {
    runTestFile(api, 'x = 5 & res = NO x');

    expect(api.readVariable('res')).toBe(0);
  });

  test('NO', () => {
    runTestFile(api, 'x = 0 & res = NO x');

    expect(api.readVariable('res')).toBe(1);
  });

  test('MOD', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = y MOD x');

    expect(api.readVariable('res')).toBe(1);
  });

  test('+', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x + y');

    expect(api.readVariable('res')).toBe(11);
  });

  test('-', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x - y');

    expect(api.readVariable('res')).toBe(-1);
  });

  test('*', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x * y');

    expect(api.readVariable('res')).toBe(30);
  });

  test('/', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x / y');

    expect(api.readVariable('res')).toBe(0);
  });

  test('+=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x += y');

    expect(api.readVariable('x')).toBe(11);
  });

  test('-=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x -= y');

    expect(api.readVariable('x')).toBe(-1);
  });

  test('*=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x *= y');

    expect(api.readVariable('x')).toBe(30);
  });

  test('/=', () => {
    runTestFile(api, 'x = 5 & y = 6 & x /= y');

    expect(api.readVariable('x')).toBe(0);
  });

  test('priorities', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = x*y + y*-x/2');

    expect(api.readVariable('res')).toBe(15);
  });

  test('priorities', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = 15*5/2');

    expect(api.readVariable('res')).toBe(37);
  });

  test('priorities', () => {
    runTestFile(api, 'x = 5 & y = 6 & res = 15/2*5');

    expect(api.readVariable('res')).toBe(35);
  });

  test('OBJ', () => {
    runTestFile(api, `res = OBJ 'test'`);

    expect(api.readVariable('res')).toBe(0);
  });

  test('OBJ', () => {
    runTestFile(api, `ADDOBJ 'test' & res = OBJ 'test'`);

    expect(api.readVariable('res')).toBe(1);
  });

  test('LOC', () => {
    runTestFile(api, `res = LOC 'test'`);

    expect(api.readVariable('res')).toBe(1);
  });

  test('LOC', () => {
    runTestFile(api, `res = LOC 'missing'`);

    expect(api.readVariable('res')).toBe(0);
  });

  test('OBJ priority', () => {
    runTestFile(api, `res = OBJ '1' = OBJ '2'`);

    expect(api.readVariable('res')).toBe(1);
    api.execCode(`addobj '1' & res = OBJ '1' = OBJ '2'`);
    expect(api.readVariable('res')).toBe(0);
    api.execCode(`addobj '2' & res = OBJ '1' = OBJ '2'`);
    expect(api.readVariable('res')).toBe(1);
  });

  test('LOC priority', () => {
    runTestFile(
      api,
      `
first = LOC 'other' = LOC 'another'
second = LOC 'start' = LOC 'another'
third = LOC 'start' = LOC 'test'
`,
    );

    expect(api.readVariable('first')).toBe(1);
    expect(api.readVariable('second')).toBe(0);
    expect(api.readVariable('third')).toBe(1);
  });
});
