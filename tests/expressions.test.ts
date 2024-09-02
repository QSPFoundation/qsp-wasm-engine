import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('operations', () => {
  let api: QspAPI;
  let error: Mock;
  let actsChanged: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    actsChanged = vi.fn();
    api.on('actions_changed', actsChanged);
  });

  afterEach(() => {
    api._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  describe('* (multiplication)', () => {
    test.each([
      [2, 4, 8],
      [-2, 4, -8],
      [-2, -4, 8],
      [0, 2, 0],
      [-2, 0, 0],
      [0, 0, 0],
      [1, 3, 3],
    ])('%i + %i = %i', (a, b, result) => {
      runTestFile(api, `res = ${a} * ${b}`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('*= (multiplication assignment)', () => {
    test.each([
      [2, 4],
      [-2, -4],
      [0, 0],
      [1, 2],
    ])('res *= %i & != %i', (a, result) => {
      runTestFile(api, `res = 2 & res *= ${a}`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('+ (addition)', () => {
    test.each([
      [2, 2, 4],
      [-2, 2, 0],
      [-2, -2, -4],
      [0, 2, 2],
      [-2, 0, -2],
      [0, 0, 0],
      [1, 3, 4],
    ])('%i + %i = %i', (a, b, result) => {
      runTestFile(api, `res = ${a} + ${b}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test('+ acts as concatenations for strings', () => {
      runTestFile(api, `$res = 'a' + 'b'`);
      expect(api.readVariable('$res')).toBe('ab');
    });

    test('+ acts as concatenations for strings with numbers', () => {
      runTestFile(api, `$res = '1' + '2'`);
      expect(api.readVariable('$res')).toBe('12');
    });

    describe('different operand types', () => {
      test('if string is convertable to number - number is returned', () => {
        runTestFile(
          api,
          `
          res = 1 + '2'
          res2 = '1' + 2
        `,
        );
        expect(api.readVariable('res')).toBe(3);
        expect(api.readVariable('$res')).toBe('');
        expect(api.readVariable('res2')).toBe(3);
        expect(api.readVariable('$res2')).toBe('');
      });
      test('if string is not convertable to number - string is returned', () => {
        runTestFile(api, `$res = 1 + '2a'`);
        expect(api.readVariable('res')).toBe(0);
        expect(api.readVariable('$res')).toBe('12a');
      });
    });
  });

  describe('+= (addition assignment)', () => {
    test.each([
      [2, 4],
      [-2, 0],
      [0, 2],
      [1, 3],
    ])('res += %i & != %i', (a, result) => {
      runTestFile(api, `res = 2 & res += ${a}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test('it acts as concatenation for strings', () => {
      runTestFile(
        api,
        `$res = 'a' 
        $res += 'b'`,
      );
      expect(api.readVariable('$res')).toBe('ab');
    });
  });

  describe('- (subtraction)', () => {
    test.each([
      [2, 2, 0],
      [-2, 2, -4],
      [-2, -2, 0],
      [0, 2, -2],
      [-2, 0, -2],
      [0, 0, 0],
      [1, 3, -2],
    ])('%i - %i = %i', (a, b, result) => {
      runTestFile(api, `res = ${a} - ${b}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test('if strin can be converted to number - it gets subtracted', () => {
      runTestFile(
        api,
        `
        res = '2' - '1'
        res2 = 2 - '1'
        res3 = '2' - 1
      `,
      );
      expect(api.readVariable('res')).toBe(1);
      expect(api.readVariable('res2')).toBe(1);
      expect(api.readVariable('res3')).toBe(1);
    });

    test('if string cannot be converted to number - error is shown', () => {
      runTestFile(api, `res = '2a' - '1'`);
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: 'Type mismatch!',
        errorCode: 101,
        line: 1,
        lineSrc: "RES = '2a' - '1'",
        localLine: 1,
        location: 'test',
      });
      error.mockReset();
    });
  });

  describe('-= (subtraction assignment)', () => {
    test.each([
      [2, 0],
      [-2, 4],
      [0, 2],
      [1, 1],
    ])('res -= %i & != %i', (a, result) => {
      runTestFile(api, `res = 2 & res -= ${a}`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('- (unary minus)', () => {
    test.each([
      [2, -2],
      [-2, 2],
      [0, 0],
    ])('-%i = %i', (a, result) => {
      runTestFile(api, `res = -${a}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test('it should negate group result', () => {
      runTestFile(api, `res = -(3 + 6) & res2 = -(-3)`);
      expect(api.readVariable('res')).toBe(-9);
      expect(api.readVariable('res2')).toBe(3);
    });

    test('it coverts and negates string', () => {
      runTestFile(api, `res = -'2'`);
      expect(api.readVariable('res')).toBe(-2);
    });

    test('error should be shown if string cannot be converted to number', () => {
      runTestFile(api, `res = -'2a'`);
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: 'Type mismatch!',
        errorCode: 101,
        line: 1,
        lineSrc: "RES = -'2a'",
        localLine: 1,
        location: 'test',
      });
      error.mockReset();
    });
  });

  describe('/ (division)', () => {
    test.each([
      [2, 2, 1],
      [4, 2, 2],
      [-4, 2, -2],
      [-4, -2, 2],
      [17, 3, 5],
      [37, 100, 0],
    ])('%i / %i = %i', (a, b, result) => {
      runTestFile(api, `res = ${a} / ${b}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test('strings are converted to numbers', () => {
      runTestFile(api, `res = '2' / '1'`);
      expect(api.readVariable('res')).toBe(2);
    });

    test('if string cannot be converted to number - error is shown', () => {
      runTestFile(api, `res = '2a' / '1'`);
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: 'Type mismatch!',
        errorCode: 101,
        line: 1,
        lineSrc: "RES = '2a' / '1'",
        localLine: 1,
        location: 'test',
      });
      error.mockReset();
    });

    test('error on zero division', () => {
      runTestFile(api, `res = 2 / 0`);
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: 'Division by zero!',
        errorCode: 100,
        line: 1,
        lineSrc: 'RES = 2 / 0',
        localLine: 1,
        location: 'test',
      });
      error.mockReset();
    });
  });

  describe('/= (division assignment)', () => {
    test.each([
      [2, 2],
      [4, 1],
      [37, 0],
    ])('res /= %i & != %i', (a, result) => {
      runTestFile(api, `res = 4 & res /= ${a}`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('< (less than)', () => {
    test.each([
      [2, 4, 1],
      [5, 5, 0],
      [7, 3, 0],
    ])('%i < %i = %i (numbers)', (a, b, result) => {
      runTestFile(api, `res = ${a} < ${b}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'z', 1],
      ['a', 'a', 0],
      ['z', 'a', 0],
      ['z', 'zz', 1],
      ['aaaaaa', 'z', 1],
      ['A', 'Z', 1],
      ['z', 'A', 0],
      ['a', 'A', 0],
    ])('%s < %s = %i (strings)', (a, b, result) => {
      runTestFile(api, `res = "${a}" < "${b}"`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('<= (less than or equal)', () => {
    test.each([
      [2, 4, 1],
      [5, 5, 1],
      [7, 3, 0],
    ])('%i <= %i = %i (numbers)', (a, b, result) => {
      runTestFile(api, `res = ${a} <= ${b}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'z', 1],
      ['a', 'a', 1],
      ['z', 'a', 0],
      ['A', 'Z', 1],
      ['z', 'A', 0],
      ['a', 'A', 0],
      ['A', 'A', 1],
    ])('%s <= %s = %i (strings)', (a, b, result) => {
      runTestFile(api, `res = "${a}" <= "${b}"`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('<> (not equal)', () => {
    test.each([
      [2, 4, 1],
      [5, 5, 0],
      [7, 3, 1],
    ])('%i <> %i = %i (numbers)', (a, b, result) => {
      runTestFile(api, `res = ${a} <> ${b}`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'z', 1],
      ['a', 'a', 0],
      ['z', 'a', 1],
      ['a', 'A', 1],
    ])('%s <> %s = %i (strings)', (a, b, result) => {
      runTestFile(api, `res = "${a}" <> "${b}"`);
      expect(api.readVariable('res')).toBe(result);
    });
  });
  describe('= (equal)', () => {
    test.each([
      [2, 2, 1],
      [4, 2, 0],
      [-17, -17, 1],
    ])('%i = %i = %i', (a, b, result) => {
      runTestFile(api, `res = (${a} = ${b})`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'a', 1],
      ['a', 'b', 0],
      ['b', 'a', 0],
      ['a', 'A', 0],
    ])('%s = %s = %i', (a, b, result) => {
      runTestFile(api, `res = ("${a}" = "${b}")`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('=< (equal or less than)', () => {
    test.each([
      [2, 2, 1],
      [4, 2, 0],
      [-17, -17, 1],
    ])('%i =< %i = %i', (a, b, result) => {
      runTestFile(api, `res = (${a} =< ${b})`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'a', 1],
      ['a', 'b', 1],
      ['b', 'a', 0],
      ['a', 'A', 0],
    ])('%s =< %s = %i', (a, b, result) => {
      runTestFile(api, `res = ("${a}" =< "${b}")`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('=> (greater than or equal)', () => {
    test.each([
      [2, 2, 1],
      [4, 2, 1],
      [-17, -17, 1],
    ])('%i => %i = %i', (a, b, result) => {
      runTestFile(api, `res = (${a} => ${b})`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'a', 1],
      ['a', 'b', 0],
      ['b', 'a', 1],
      ['a', 'A', 1],
    ])('%s => %s = %i', (a, b, result) => {
      runTestFile(api, `res = ("${a}" => "${b}")`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('> (greater than)', () => {
    test.each([
      [2, 2, 0],
      [4, 2, 1],
      [-17, -17, 0],
    ])('%i > %i = %i', (a, b, result) => {
      runTestFile(api, `res = (${a} > ${b})`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'a', 0],
      ['a', 'b', 0],
      ['b', 'a', 1],
      ['a', 'A', 1],
    ])('%s > %s = %i', (a, b, result) => {
      runTestFile(api, `res = ("${a}" > "${b}")`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('>= (greater than or equal)', () => {
    test.each([
      [2, 2, 1],
      [4, 2, 1],
      [-17, -17, 1],
    ])('%i >= %i = %i', (a, b, result) => {
      runTestFile(api, `res = (${a} >= ${b})`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'a', 1],
      ['a', 'b', 0],
      ['b', 'a', 1],
      ['a', 'A', 1],
    ])('%s >= %s = %i', (a, b, result) => {
      runTestFile(api, `res = ("${a}" >= "${b}")`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('! (not equal)', () => {
    test.each([
      [2, 2, 0],
      [4, 2, 1],
      [-17, -17, 0],
    ])('%i != %i = %i', (a, b, result) => {
      runTestFile(api, `res = (${a} ! ${b})`);
      expect(api.readVariable('res')).toBe(result);
    });

    test.each([
      ['a', 'a', 0],
      ['a', 'b', 1],
      ['b', 'a', 1],
      ['a', 'A', 1],
    ])('%s != %s = %i', (a, b, result) => {
      runTestFile(api, `res = ("${a}" ! "${b}")`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('& (concatenation)', () => {
    test('string contenations', () => {
      runTestFile(api, `$res = ('a' & 'b')`);
      expect(api.readVariable('$res')).toBe('ab');
    });

    test('number are convered to string and concatenated', () => {
      runTestFile(api, `res = (1 & 2)`);
      expect(api.readVariable('res')).toBe(12);
    });
  });

  describe('NO (logical not)', () => {
    test.each([
      ['3 = 2', 1],
      ['2 = 2', 0],
    ])('NO (%s) = %i', (a, result) => {
      runTestFile(api, `res = NO (${a})`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('AND (logical and)', () => {
    test.each([
      ['2 = 2', '3 <> 2', 1],
      ['3 <> 2', '2 = 2', 1],
      ['2 <> 2', '3 <> 2', 0],
      ['2 <> 2', '3 = 2', 0],
    ])('%s AND %s = %i', (a, b, result) => {
      runTestFile(api, `res = (${a}) AND (${b})`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('OR (logical or)', () => {
    test.each([
      ['2 = 2', '3 <> 2', 1],
      ['3 <> 2', '2 = 2', 1],
      ['2 <> 2', '3 <> 2', 1],
      ['2 <> 2', '3 = 2', 0],
    ])('%s OR %s = %i', (a, b, result) => {
      runTestFile(api, `res = (${a}) OR (${b})`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('LOC (location test)', () => {
    test('should return 1 if location exists', () => {
      runTestFile(api, `res = LOC('test')`);
      expect(api.readVariable('res')).toBe(1);
    });
    test('should return 0 if location does exists', () => {
      runTestFile(api, `res = LOC('unknown')`);
      expect(api.readVariable('res')).toBe(0);
    });
  });

  describe('OBJ (object test)', () => {
    test('should return 1 if object exists', () => {
      runTestFile(api, `addobj 'test' & res = OBJ('test')`);
      expect(api.readVariable('res')).toBe(1);
    });
    test('should return 0 if object does exists', () => {
      runTestFile(api, `res = OBJ('unknown')`);
      expect(api.readVariable('res')).toBe(0);
    });
  });

  describe('MOD (modulo)', () => {
    test.each([
      [4, 2, 0],
      [5, 2, 1],
      [-7, 5, -2],
      [7, -5, 2],
      [-7, -5, -2],
    ])('%i %% %i = %i', (a, b, result) => {
      runTestFile(api, `res = (${a} MOD ${b})`);
      expect(api.readVariable('res')).toBe(result);
    });
  });

  describe('priorities', () => {
    test('same level priority', () => {
      runTestFile(api, `res = 15*5/2
        res2 = 15/2*5`);
      expect(api.readVariable('res')).toBe(37);
      expect(api.readVariable('res2')).toBe(35);
    });

    test('multi level priorities', () => {
      runTestFile(api, 'x = 5 & y = 6 & res = x*y + y*-x/2');
  
      expect(api.readVariable('res')).toBe(15);
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
  })
});
