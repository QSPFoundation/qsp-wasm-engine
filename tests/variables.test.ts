import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, runTestFileWithGoto } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('variables', () => {
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

  test('default number value', () => {
    expect(api.readVariable('not_defined')).toBe(0);
  });

  test('default string value', () => {
    expect(api.readVariable('$not_defined')).toBe('');
  });

  test('variables are case insensitive', () => {
    runTestFile(api, `money = 100 & MONEY += 1`);

    expect(api.readVariable('MoNeY')).toBe(101);
  });

  test('LET assignment', () => {
    runTestFile(api, `LET money = 100`);

    expect(api.readVariable('money')).toBe(100);
  });

  test('SET assignment', () => {
    runTestFile(api, `SET money = 100`);

    expect(api.readVariable('money')).toBe(100);
  });

  test('assignment', () => {
    runTestFile(api, `money = 100`);

    expect(api.readVariable('money')).toBe(100);
  });

  test('assignment to array item by numeric index', () => {
    runTestFile(api, `money[2] = 100`);

    expect(api.readVariableByIndex('money', 0)).toBe(0);
    expect(api.readVariableByIndex('money', 1)).toBe(0);
    expect(api.readVariableByIndex('money', 2)).toBe(100);
  });

  test('assignment to array item by string index', () => {
    runTestFile(api, `money['key'] = 100`);

    expect(api.readVariableByKey('money', 'key')).toBe(100);
  });

  test('multi assignment', () => {
    runTestFile(api, `a, $b, $c, d = 1, 'test', 'other', 2`);

    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('$b')).toBe('test');
    expect(api.readVariable('$c')).toBe('other');
    expect(api.readVariable('d')).toBe(2);
  });

  test('multi assignment with explicit tuple', () => {
    runTestFile(api, `a, $b, $c, d = [1, 'test', 'other', 2]`);

    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('$b')).toBe('test');
    expect(api.readVariable('$c')).toBe('other');
    expect(api.readVariable('d')).toBe(2);
  });

  test('multi assignment with array and numeric indices', () => {
    runTestFile(api, `a[3], $b[2], $c[1], d = 1, 'test', 'other', 2`);

    expect(api.readVariableByIndex('a', 3)).toBe(1);
    expect(api.readVariableByIndex('$b', 2)).toBe('test');
    expect(api.readVariableByIndex('$c', 1)).toBe('other');
    expect(api.readVariable('d')).toBe(2);
  });

  test('multi assignment with array and string indices', () => {
    runTestFile(api, `a['t1'], $b['t2'], $c['t3'], d = 1, 'test', 'other', 2`);

    expect(api.readVariableByKey('a', 't1')).toBe(1);
    expect(api.readVariableByKey('$b', 't2')).toBe('test');
    expect(api.readVariableByKey('$c', 't3')).toBe('other');
    expect(api.readVariable('d')).toBe(2);
  });

  test('partial assignment', () => {
    runTestFile(api, `a, $b, $c, d, %e = 3, 'test'`);

    expect(api.readVariable('a')).toBe(3);
    expect(api.readVariable('$b')).toBe('test');
    expect(api.readVariable('$c')).toBe('');
    expect(api.readVariable('d')).toBe(0);
    expect(api.readVariable('%e')).toEqual([]);
  });

  test('local without assignment', () => {
    runTestFile(api,
      `
a_new, $b_new, c_new = 1, 'old', 2
local a, $b, c
a_new, $b_new, c_new = a, $b, c
    `);

    expect(api.readVariable('a_new')).toBe(0);
    expect(api.readVariable('$b_new')).toBe('');
    expect(api.readVariable('c_new')).toBe(0);
  });

  test('multi assignment local', () => {
    runTestFile(api,
      `
a_new, $b_new, $c_new, d_new = 1, 'old', 'oldest', 2
local a, $b, $c, d = 3, 'test', 'other', 4
a_new, $b_new, $c_new, d_new = a, $b, $c, d
    `);

    expect(api.readVariable('a_new')).toBe(3);
    expect(api.readVariable('$b_new')).toBe('test');
    expect(api.readVariable('$c_new')).toBe('other');
    expect(api.readVariable('d_new')).toBe(4);
  });

  test('local with partial assignment', () => {
    runTestFile(api,
      `
a_new, $b_new, $c_new, d_new = 1, 'old', 'oldest', 2
local a, $b, $c, d = 3, 'test'
a_new, $b_new, $c_new, d_new = a, $b, $c, d
    `);

    expect(api.readVariable('a_new')).toBe(3);
    expect(api.readVariable('$b_new')).toBe('test');
    expect(api.readVariable('$c_new')).toBe('');
    expect(api.readVariable('d_new')).toBe(0);
  });

  test('multi assignment with the same variable and last num value', () => {
    runTestFile(api, `a, $a, A = 2, 'test', 4`);

    expect(api.readVariable('a')).toBe(4);
    expect(api.readVariable('$a')).toBe('');
  });

  test('multi assignment with the same variable and last string value', () => {
    runTestFile(api, `$a, a, $A = 'test', 3, 'new'`);

    expect(api.readVariable('a')).toBe(0);
    expect(api.readVariable('$a')).toBe('new');
  });

  test('multi assignment local with the same variable and last num value', () => {
    runTestFile(api,
      `
local a, $a, A = 2, 'test', 4
new_num, $new_str = a, $a
    `);

    expect(api.readVariable('new_num')).toBe(4);
    expect(api.readVariable('$new_str')).toBe('');
  });

  test('multi assignment local with the same variable and last string value', () => {
    runTestFile(api,
      `
local $a, a, $A = 'test', 3, 'new'
new_num, $new_str = a, $a
    `);

    expect(api.readVariable('new_num')).toBe(0);
    expect(api.readVariable('$new_str')).toBe('new');
  });

  test('multi assignment with the same array', () => {
    runTestFile(api, `a[1], $a[2], A[3] = 2, 'test', 4`);

    expect(api.readVariableByIndex('a', 1)).toBe(2);
    expect(api.readVariableByIndex('$a', 2)).toBe('test');
    expect(api.readVariableByIndex('a', 3)).toBe(4);
  });

  test('global variables get restored after killvar with local', () => {
    runTestFile(api,
      `
a = 1 & $b = 'test' & c = 3
if 1:
  local a, $b
  killvar
end
    `);

    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('$b')).toBe('test');
    expect(api.readVariable('c')).toBe(0);
  });

  test('variable swap', () => {
    runTestFile(
      api,
      `
$x = "aa"
$y = "bb"
$y, $x = $x, $y
    `);

    expect(api.readVariable('$x')).toBe("bb");
    expect(api.readVariable('$y')).toBe("aa");
  });

  test('local', () => {
    runTestFile(
      api,
      `
$a = "aa" & $b = "bb" & $c = "cc" & $d = "dd" & $e = "ee" & $f = "ff"
gs 'other'
---
# other
local $a,$b,$c,$d,$e,$f = "la","lb","lc","ld","le","lf"
$la = $a
$lb = $b
$lc = $c
$ld = $d
$le = $e
$lf = $f
    `);

    expect(api.readVariable('$a')).toBe("aa");
    expect(api.readVariable('$la')).toBe("la");
    expect(api.readVariable('$b')).toBe("bb");
    expect(api.readVariable('$lb')).toBe("lb");
    expect(api.readVariable('$c')).toBe("cc");
    expect(api.readVariable('$lc')).toBe("lc");
    expect(api.readVariable('$d')).toBe("dd");
    expect(api.readVariable('$ld')).toBe("ld");
    expect(api.readVariable('$e')).toBe("ee");
    expect(api.readVariable('$le')).toBe("le");
    expect(api.readVariable('$f')).toBe("ff");
    expect(api.readVariable('$lf')).toBe("lf");
  });

  test('local variables in nested calls are preserved (shadowing global)', () => {
    runTestFile(
      api,
      `
$a = "aa"
gs 'other'
--- 
# other
local $a = "la"
$la = $a
gs 'nested'
---
# nested
$na = $a 
    `);

    expect(api.readVariable('$a')).toBe("aa");
    expect(api.readVariable('$la')).toBe("la");
    expect(api.readVariable('$na')).toBe("la");
  });

  test('local reset on subsequent calls', () => {
    runTestFile(
      api,
      `
gs 'other', 'first', "ff"
gs 'other', 'second', "ss"
---
# other
local $a
$a[] = $args[1]
size[$args[0]] = arrsize('a')
$res[$args[0]] = $a[0]
    `);

    expect(api.readVariableByKey('$res', 'first')).toBe("ff");
    expect(api.readVariableByKey('$res', 'second')).toBe("ss");
    expect(api.readVariableByKey('size', 'first')).toBe(1);
    expect(api.readVariableByKey('size', 'second')).toBe(1);
  });

  test('local variables are not visible in actions (unlike args)', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);

    runTestFileWithGoto(
      api,
      `
local $a = "aa"
$args[0] = "bb"
act '1': $a & $args[0]
    `);

    api.selectAction(0);
    api.execSelectedAction();

    expect(onMain).toHaveBeenCalledWith('\r\nbb\r\n');
  });

  test('local variables inside actions', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);

    runTestFile(
      api,
      `
$i="ii"
act "local i":
    local $i = "lii"
    *pl $i
end
act "global i":
    *pl $i
end
    `);

    api.selectAction(0);
    api.execSelectedAction();

    expect(onMain).toHaveBeenCalledWith('lii\r\n');

    api.selectAction(1);
    api.execSelectedAction();

    expect(onMain).toHaveBeenCalledWith('lii\r\nii\r\n');
  });

  test('local variables available with flow stop in callbacks', () => {
    const onMsg = vi.fn();
    api.on('msg', onMsg);

    runTestFile(
      api,
      `local $i="ii" & msg ''`
    );

    expect(api.readVariable('$i')).toBe("ii");
    onMsg.mock.calls[0][1]();
    expect(api.readVariable('$i')).toBe("");
  })
});
