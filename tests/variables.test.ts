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

  test('multi assignment', () => {
    runTestFile(api, `a, $b, $c, d = 1, 'test', 'other', 2`);

    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('$b')).toBe('test');
    expect(api.readVariable('$c')).toBe('other');
    expect(api.readVariable('d')).toBe(2);
  });

  test('variable swap', () => {
    runTestFile(
      api,
      `
$x = "aa"
$y = "bb"
$y, $x  = $x, $y`,
    );

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
    `,
    );

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

  test('local variables in nested calls is preserved (shadowing global)', () => {
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
`,
    );

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
`,
    );

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
      `,
    );

    api.selectAction(0);
    api.execSelectedAction();

    expect(onMain).toHaveBeenCalledWith('\r\nbb\r\n');
  });

  test('local variables inside actions', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);

    runTestFile(
      api,
      `$i="ii"
act "local i":
    local $i = "lii"
    *pl $i
end
act "global i":
    *pl $i
end`,
    );

    api.selectAction(0);
    api.execSelectedAction();

    expect(onMain).toHaveBeenCalledWith('lii\r\n');

    api.selectAction(1);
    api.execSelectedAction();

    expect(onMain).toHaveBeenCalledWith('lii\r\nii\r\n');
  });

  test('local variables avaliable whith flow stop in callbacks', () => {
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
