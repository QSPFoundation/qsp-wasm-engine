import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('dynamics', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  describe('DYNAMIC', () => {
    test('creating dynamic var name', () => {
      runTestFile(
        api,
        `
        $a = 'test'
        DYNAMIC "<<$a>>_1 = 12" 
      `,
      );
      expect(api.readVariable('test_1')).toBe(12);
    });

    test('regular strings evaluate expressions when created', () => {
      const onMain = vi.fn();
      api.on('main_changed', onMain);

      runTestFile(
        api,
        `
        $args[0] = 'qwerty'
        $code = '
            *pl "<<$args[0]>>"
            *pl $args[0]
        '
        
        dynamic $code, 'asdfg'
      `,
      );

      expect(onMain).toHaveBeenCalledWith('qwerty\r\nasdfg\r\n', false);
    });

    test('curly braces evaluate expressions when dynamic is called', () => {
      const onMain = vi.fn();
      api.on('main_changed', onMain);

      runTestFile(
        api,
        `
        $args[0] = 'qwerty'
        $code = {
            *pl "<<$args[0]>>"
            *pl $args[0]
        }
        
        dynamic $code, 'asdfg'
      `,
      );

      expect(onMain).toHaveBeenCalledWith('asdfg\r\nasdfg\r\n', false);
    });

    test('args should be isolated from location', () => {
      runTestFile(
        api,
        `
      gt 'with_dynamic', 'test', 2, 4
---
# with_dynamic
  $before_0 = $args[0]
  before_1 = args[1]
  before_2 = args[2]
  dynamic {
    $in_0 = $args[0]
    in_1 = args[1]
    in_2 = args[2]
  }, 'other', 3
  $after_0 = $args[0]
  after_1 = args[1]
  after_2 = args[2]
      `,
      );

      expect(api.readVariable('$before_0')).toBe('test');
      expect(api.readVariable('before_1')).toBe(2);
      expect(api.readVariable('before_2')).toBe(4);
      expect(api.readVariable('$after_0')).toBe('test');
      expect(api.readVariable('after_1')).toBe(2);
      expect(api.readVariable('after_2')).toBe(4);
      expect(api.readVariable('$in_0')).toBe('other');
      expect(api.readVariable('in_1')).toBe(3);
      expect(api.readVariable('in_2')).toBe(0);
    });
  });

  describe('DYNEVAL', () => {
    test('returning number result', () => {
      runTestFile(
        api,
        `
        res = dyneval('result = 3 + 4')
        `,
      );

      expect(api.readVariable('res')).toBe(7);
    });

    test('returning string result', () => {
      runTestFile(
        api,
        `
          $res = $dyneval('$result = mid("abcd", 2, 1) + "qwerty"')
          `,
      );

      expect(api.readVariable('$res')).toBe('bqwerty');
    });

    test('inplicit operator should not add new line if there was no return', () => {
      const onMain = vi.fn();
      api.on('main_changed', onMain);
      runTestFile(
        api,
        `
123
dyneval("code = 123 + 890")
code          `,
      );

      expect(onMain).toHaveBeenCalledWith('123\r\n1013\r\n', false);
    });
  
    test('args should be isolated from locations', () => {
      runTestFile(
        api,
        `
      top_result = func('with_dyneval', 'test', 2, 4)
---
# with_dyneval
$before_0 = $args[0]
before_1 = args[1]
before_2 = args[2]
result = 5
dyn_result = DYNEVAL({
  $in_0 = $args[0]
  in_1 = args[1]
  in_2 = args[2]
  result = 10
}, 'other', 3)
$after_0 = $args[0]
after_1 = args[1]
after_2 = args[2]
after_result = result
      `,
      );

      expect(api.readVariable('$before_0')).toBe('test');
      expect(api.readVariable('before_1')).toBe(2);
      expect(api.readVariable('before_2')).toBe(4);
      expect(api.readVariable('$after_0')).toBe('test');
      expect(api.readVariable('after_1')).toBe(2);
      expect(api.readVariable('after_2')).toBe(4);
      expect(api.readVariable('$in_0')).toBe('other');
      expect(api.readVariable('in_1')).toBe(3);
      expect(api.readVariable('in_2')).toBe(0);
      expect(api.readVariable('dyn_result')).toBe(10);
      expect(api.readVariable('after_result')).toBe(5);
      expect(api.readVariable('top_result')).toBe(5);
    });
  });
});
