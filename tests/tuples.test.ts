import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('tuples', () => {
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

  describe('defining tuple', () => {
    test('default tuple value', () => {
      runTestFile(api, ``);

      expect(api.readVariable('%a')).toEqual([]);
    });

    test('defining tuple with parenthesis', () => {
      runTestFile(api, `%a = ("a", "b", "c")`);
      expect(api.readVariable('%a')).toEqual(['a', 'b', 'c']);
    });

    test('nested tuple with parenthesis', () => {
      runTestFile(api, `%a = ("a", ("b", "c"))`);
      expect(api.readVariable('%a')).toEqual(['a', ['b', 'c']]);
    });

    test('defining tuple with brackets', () => {
      runTestFile(api, `%a = ["a", "b", "c"]`);
      expect(api.readVariable('%a')).toEqual(['a', 'b', 'c']);
    });

    test('nested tuple with brackets', () => {
      runTestFile(api, `%a = ["1", ["2", "3"]]`);
      expect(api.readVariable('%a')).toEqual(['1', ['2', '3']]);
    });

    test('defining tuple with comma', () => {
      runTestFile(api, `%a = "a", "b", "c"`);
      expect(api.readVariable('%a')).toEqual(['a', 'b', 'c']);
    });

    test('mixing brackets and parenthesis', () => {
      runTestFile(api, `%a = ["a", ("b", "c")]`);
      expect(api.readVariable('%a')).toEqual(['a', ['b', 'c']]);
    });

    test('strings and numbers', () => {
      runTestFile(api, `%a = '1', 2, 3`);
      expect(api.readVariable('%a')).toEqual(['1', 2, 3]);
    });

    test('single item tuple with parenthesis', () => {
      runTestFile(api, `%a = (1)`);
      expect(api.readVariable('%a')).toEqual([1]);
    });

    test('single item tuple with brackets', () => {
      runTestFile(api, `%a = [1]`);
      expect(api.readVariable('%a')).toEqual([1]);
    });

    test('nested tuple with single item', () => {
      runTestFile(api, `%a = ("a", ["b"]) & %b = ("a", ("b"))`);
      expect(api.readVariable('%a')).toEqual(['a', ['b']]);
      expect(api.readVariable('%b')).toEqual(['a', 'b']);
    });

    test('nested single item in parenthesis will not create a tuple', () => {
      runTestFile(api, `%a = ("a", ("a"))`);

      expect(api.readVariable('%a')).toEqual(['a', 'a']);
    });

    test('array of tuples', () => {
      runTestFile(
        api,
        `
        %a[] = ["a", "b", "c"]
        %a[] = ["b", "c", "d"]
        `,
      );

      expect(api.readVariableByIndex('%a', 0)).toEqual(['a', 'b', 'c']);
      expect(api.readVariableByIndex('%a', 1)).toEqual(['b', 'c', 'd']);
    });
  });

  describe('unpacking tuples', () => {
    test('unpacking to variables', () => {
      runTestFile(
        api,
        `
      %a = (1, 2, 3)
      b, c, d = %a
      `,
      );
      expect(api.readVariable('b')).toEqual(1);
      expect(api.readVariable('c')).toEqual(2);
      expect(api.readVariable('d')).toEqual(3);
    });

    test('unpacking mixed values', () => {
      runTestFile(
        api,
        `
      %a = ('a', 2, [3, 'b'])
      $b, c, %d = %a
      `,
      );
      expect(api.readVariable('$b')).toEqual('a');
      expect(api.readVariable('c')).toEqual(2);
      expect(api.readVariable('%d')).toEqual([3, 'b']);
    });

    test('using tuple to grab rest of values', () => {
      runTestFile(
        api,
        `
      %a = ["a", 2, "b", 3]
      $b, %c = %a`,
      );

      expect(api.readVariable('$b')).toEqual('a');
      expect(api.readVariable('%c')).toEqual([2, 'b', 3]);
    });

    test('rest tuple should be empty if there were no values left', () => {
      runTestFile(
        api,
        `%a = ["a", "c"]
        $b, $c, d, $f, %rest = %a`,
      );

      expect(api.readVariable('$b')).toEqual('a');
      expect(api.readVariable('$c')).toEqual('c');
      expect(api.readVariable('d')).toEqual(0);
      expect(api.readVariable('$f')).toEqual('');
      expect(api.readVariable('%rest')).toEqual([]);
    });

    test('swaping value without tmp variable', () => {
      runTestFile(
        api,
        `a = 1 & b = 2
        a,b = b,a`,
      );

      expect(api.readVariable('a')).toEqual(2);
      expect(api.readVariable('b')).toEqual(1);
    });
  });

  describe('array indexing', () => {
    test('using tuple as array index', () => {
      runTestFile(
        api,
        `
      b["1", "2"] = 3
      a = b["1", "2"]
      `,
      );

      expect(api.readVariable('a')).toEqual(3);
    });

    test('using nested tuple as array index', () => {
      runTestFile(
        api,
        `
      b[1, ("2", 3)] = 3
      a = b[1, ("2", 3)]
      `,
      );

      expect(api.readVariable('a')).toEqual(3);
    });

    test('using mixed value tuple for indexing', () => {
      runTestFile(
        api,
        `
      b['a', 2] = 3
      a = b['a', 2]
      `,
      );

      expect(api.readVariable('a')).toEqual(3);
    });
  });

  describe('operations', () => {
    test('value & tuple', () => {
      runTestFile(api, `%a = (1 & [2, 3])`);
      expect(api.readVariable('%a')).toEqual([1, 2, 3]);
    });

    test('tuple & value', () => {
      runTestFile(api, `%a = ([2, 3] & 1)`);
      expect(api.readVariable('%a')).toEqual([2, 3, 1]);
    });

    test('tuple & tuple', () => {
      runTestFile(api, `%a = ([2, 3] & [1, 4])`);
      expect(api.readVariable('%a')).toEqual([2, 3, 1, 4]);
    });

    test.each([
      ['[3,2]+4', '[3+4,2+4]', [7, 6]],
      ['[3,2]-4', '[3-4,2-4]', [-1, -2]],
      ['[3,2]*4', '[3*4,2*4]', [12, 8]],
      ['[8,4]/4', '[8/4,4/4]', [2, 1]],
      ['4+[3,4]', '[4+3,4+4]', [7, 8]],
      ['4-[3,4]', '[4-3,4-4]', [1, 0]],
      ['4*[3,4]', '[4*3,4*4]', [12, 16]],
      ['4/[2,4]', '[4/2,4/4]', [2, 1]],
      ['["ab","cd"] + "ab"', '["ab" + "ab", "cd" + "ab"]', ['abab', 'cdab']],
      [
        '[1,2]*[3,4,5]',
        '[[1*[3,4,5], 2*[3,4,5]] = [[1*3,1*4,1*5],[2*3,2*4,2*5]]',
        [
          [3, 4, 5],
          [6, 8, 10],
        ],
      ],
    ])('%s = %s', (a, _, result) => {
      console.log({ a, result });
      runTestFile(api, `%res = ${a}`);

      expect(api.readVariable('%res')).toEqual(result);
    });

    test.each([
      ['[8, 4]', '+=', 4, [12, 8]],
      ['[8, 4]', '-=', 4, [4, 0]],
      ['[8, 4]', '*=', 4, [32, 16]],
      ['[8, 4]', '/=', 4, [2, 1]],
      [
        '[8, 4]',
        '+=',
        '[1 ,2]',
        [
          [9, 10],
          [5, 6],
        ],
      ],
      ['["aa", "bb"]', '+=', '"bb"', ['aabb', 'bbbb']],
    ])('%s %s %s = %s', (a, op, b, result) => {
      runTestFile(
        api,
        `
        %res = ${a}
        %res ${op} ${b}`,
      );

      expect(api.readVariable('%res')).toEqual(result);
    });
  });

  describe('val', () => {
    test.each([
      ['[]', 0],
      ['[44]', 44],
      ['[2,3]', 0],
      ["['55']", 55],
      ["['55a']", 0],
    ])('%s = %s', (a, result) => {
      runTestFile(api, `res = val(${a})`);
      expect(api.readVariable('res')).toEqual(result);
    });
  });

  describe('isnum', () => {
    test.each([
      ['[]', 0],
      ['[44]', 1],
      ['[2,3]', 0],
      ["['55']", 1],
      ["['55a']", 0],
    ])('%s = %s', (a, result) => {
      runTestFile(api, `res = isnum(${a})`);
      expect(api.readVariable('res')).toEqual(result);
    });
  });

  describe('STR', () => {
    test.each([
      ['[]', '[]'],
      ['()', '[]'],
      ['[44]', '[44]'],
      ['[2,3]', '[2,3]'],
      ["['55']", "['55']"],
      ["['55a']", "['55a']"],
    ])('%s = %s', (a, result) => {
      runTestFile(
        api,
        `%a = ${a}
      $res = STR(%a)`,
      );
      expect(api.readVariable('$res')).toEqual(result);
    });
  });

  describe('KILLVAR', () => {
    test('deleting by tuple key', () => {
      runTestFile(
        api,
        `
        b[1,2] = 3
        killvar 'b', [1,2]
        res = b[1, 2]
        `,
      );

      expect(api.readVariable('res')).toEqual(0);
    });
  });

  describe('LEN', () => {
    test('it should return tuple size', () => {
      runTestFile(
        api,
        `
        %a = [1, 2, 3]
        res = len(%a)
        %b = []
        res_b = len(%b)
        `,
      );

      expect(api.readVariable('res')).toEqual(3);
      expect(api.readVariable('res_b')).toEqual(0);
    });
  });

  describe('using in functions', () => {
    test('passing tuple as parameter', () => {
      runTestFile(
        api,
        `
gs 'other', ["a", "b"]
---
# other
%res = %args[0]`,
      );

      expect(api.readVariable('%res')).toEqual(['a', 'b']);
    });

    test('returning tuple from function', () => {
      runTestFile(
        api,
        `
%res = func('other')
---
# other
%result = ["1", "2"]`,
      );

      expect(api.readVariable('%res')).toEqual(['1', '2']);
    });

    test('unpacking returning tuple from function', () => {
      runTestFile(
        api,
        `
$a, $b = func('other')
---
# other
%result = ["1", "2"]`,
      );

      expect(api.readVariable('$a')).toEqual('1');
      expect(api.readVariable('$b')).toEqual('2');
    });

    test('returning tuple from dyneval', () => {
      runTestFile(api, `%res = dyneval('%result = ["1", "2"]')`);

      expect(api.readVariable('%res')).toEqual(['1', '2']);
    });
  });

  describe('MENU', () => {
    test('defining menu with tuples', () => {
      const onMenu = vi.fn();
      api.on('menu', onMenu);

      runTestFile(
        api,
        `
        %a[]=('item 6', 'handler')
        %a[]=(6666, 'handler', '1.jpg')
        %a[]=(['tuple','test'], 'handler')
        
        menu 'a'`,
      );

      expect(onMenu).toHaveBeenCalledWith(
        [
          {
            image: '',
            name: 'item 6',
          },
          {
            image: '1.jpg',
            name: '6666',
          },
          {
            image: '',
            name: "['tuple','test']",
          },
        ],
        expect.any(Function),
      );
      onMenu.mock.calls[0][1](-1);
    });
  });

  test('it errors out on more than 20 elements', () => {
    runTestFile(
      api,
      `
      %a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"]
      `,
    );

    expect(error).toHaveBeenCalledWith({
      actionIndex: -1,
      description: "Incorrect arguments' count!",
      errorCode: 119,
      line: 2,
      lineSrc:
        '%A = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"]',
      localLine: 2,
      location: 'test',
    });
    error.mockReset();
  });

  test('can grow over 20 elements with concatenation', () => {
    runTestFile(
      api,
      `
      %a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]
      %b = ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]
      %res = (%a & %b)
      `,
    );

    expect(api.readVariable('%res')).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
    ]);
  });
});
