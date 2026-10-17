import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, nextTick } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('system locations', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('$ONGLOAD', async () => {
    const onCloseFile = vi.fn();
    api.on('close_file', onCloseFile);
    runTestFile(
      api,
      `
x = 2
$ONGLOAD = 'gload'
---
# gload
x = 1
`,
    );
    const save = await api.saveGame();
    if (!save) throw new Error('failed to save');
    api.loadSave(save);
    onCloseFile.mock.calls[0][1]();
    await nextTick();
    
    expect(api.readVariable('x')).toBe(1);
  });

  test('saves and loads a state bigger than the initial buffer', async () => {
    api.on('close_file', (_file, resolve) => resolve());
    await runTestFile(api, `x = 7`);
    await api.execCode(
      `loop i = 0 while i < 4000 step i += 1: $a[i] = $str(i) + ' some text to make the save big'`,
    );
    const save = await api.saveGame();
    if (!save) throw new Error('failed to save');
    expect(save.byteLength).toBeGreaterThan(64 * 1024);
    await api.execCode(`x = 0 & killvar '$a'`);
    await api.loadSave(save);

    expect(api.readVariable('x')).toBe(7);
    expect(api.readVariableSize('$a')).toBe(4000);
    expect(api.readVariableByIndex('$a', 3999)).toBe('3999 some text to make the save big');
  });

  test('$ONGSAVE', async () => {
    runTestFile(
      api,
      `
x = 2
$ONGSAVE = 'gsave'
---
# gsave
x = 1
`,
    );
    const save = await api.saveGame();
    if (!save) throw new Error('failed to save');
    expect(api.readVariable('x')).toBe(1);
  });

  test('$ONOBJADD', () => {
    runTestFile(
      api,
      `
$ONOBJADD = 'objadd'
addobj 'test', '1.png'
---
# objadd
$name = $args[0]
$image = $args[1]
`,
    );
    expect(api.readVariable('$name')).toBe('test');
    expect(api.readVariable('$image')).toBe('1.png');
  });

  test('$ONOBJDEL', () => {
    runTestFile(
      api,
      `
$ONOBJDEL = 'objdel'
addobj 'test', '1.png'
delobj 'test'
---
# objdel
$name = $args[0]
`,
    );
    expect(api.readVariable('$name')).toBe('test');
  });

  test('$ONOBJSEL', () => {
    runTestFile(
      api,
      `
$ONOBJSEL = 'objsel'
addobj 'test'
addobj 'test1'
---
# objsel
$name = $selobj
`,
    );
    api.selectObject(1);
    expect(api.readVariable('$name')).toBe('test1');
  });

  test('$ONNEWLOC', () => {
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    runTestFile(
      api,
      `
$ONNEWLOC = 'newloc' 
gt 'other'
---
# newloc
pl 'newloc'
$cur = $curloc
---
# other
pl 'other'
  `,
    );

    expect(onStats).toHaveBeenCalledWith('other\r\nnewloc\r\n');
    expect(api.readVariable('$cur')).toBe('other');
  });

  test('$ONNEWLOC should receive args on actual location', () => {
    runTestFile(
      api,
      `
$ONNEWLOC = 'newloc' 
gt 'other', 'test', 1
---
# newloc
$args_0 = $args[0]
args_1 = args[1]
---
# other
  `,
    );

    expect(api.readVariable('$args_0')).toBe('test');
    expect(api.readVariable('args_1')).toBe(1);
  });

  test('$ONACTSEL', () => {
    runTestFile(
      api,
      `
$ONACTSEL = 'actsel'
act '1': 1
act '2': 2
---
# actsel
$sel = $SELACT
`,
    );
    api.selectAction(1);

    expect(api.readVariable('$sel')).toBe('2');

    api.selectAction(0);

    expect(api.readVariable('$sel')).toBe('1');

    api.execCode(`$sel = ''`);
    api.selectAction(-1);

    expect(api.readVariable('$sel')).toBe('');
  });

  test('$USERCOM', () => {
    runTestFile(
      api,
      `
    x = 1
    $USERCOM = 'usercom'
---
# usercom
x = 2
$text = $user_text
`,
    );

    expect(api.readVariable('x')).toBe(1);
    api.updateUserInput('test');
    expect(api.readVariable('x')).toBe(2);
    expect(api.readVariable('$text')).toBe('test');
  });
});
