import { Mock, beforeEach, describe, vi, test, expect } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('strings', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });

  test('$ONGLOAD', () => {
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
    const save = api.saveGame();
    if (!save) throw new Error('failed to save');
    api.loadSave(save);
    onCloseFile.mock.calls[0][1]();
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(1);
  });

  test('$ONGSAVE', () => {
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
    const save = api.saveGame();
    if (!save) throw new Error('failed to save');
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
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

    expect(error).not.toHaveBeenCalled();
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

    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$sel')).toBe('2');
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
