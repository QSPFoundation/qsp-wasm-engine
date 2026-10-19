import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('Main panel', () => {
  let api: QspAPI;
  let error: Mock;
  let mainChanged: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    mainChanged = vi.fn();
    api.on('main_changed', mainChanged);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('*p should print text without line break', async () => {
    await runTestFile(api, `*p 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works', false);
  });

  test('*pl should print text with line break', async () => {
    await runTestFile(api, `*pl 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works\r\n', false);
  });

  test('*nl should print text with line break in front', async () => {
    await runTestFile(api, `*nl 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('\r\nworks', false);
  });

  test('MAINTXT should return text from main panel', async () => {
    await runTestFile(api, `*p 'works' & $text = MAINTXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('$MAINTXT should return text from main panel', async () => {
    await runTestFile(api, `*p 'works' & $text = $MAINTXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('$MAINTXT() should return text from main panel', async () => {
    await runTestFile(api, `*p 'works' & $text = $MAINTXT()`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('*CLEAR should clear main description', async () => {
    await runTestFile(api, `*p 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works', false);

    api.execCode('*CLEAR');

    expect(mainChanged).toHaveBeenCalledTimes(2);
    expect(mainChanged).toHaveBeenCalledWith('', false);
  });

  test('*CLR should clear main description', async () => {
    await runTestFile(api, `*p 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works', false);

    api.execCode('*CLR');

    expect(mainChanged).toHaveBeenCalledTimes(2);
    expect(mainChanged).toHaveBeenCalledWith('', false);
  });

  test('CLS should clear main description', async () => {
    await runTestFile(api, `*p 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works', false);

    api.execCode('CLS');

    expect(mainChanged).toHaveBeenCalledTimes(2);
    expect(mainChanged).toHaveBeenCalledWith('', false);
  });

  test('implicit output to main', async () => {
    await runTestFile(
      api,
      `
        'test1'
        1
        'test2'
      `
    )
    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('test1\r\n1\r\ntest2\r\n', false);
  })

  test('implicit output is not working with functions that does not return', async () => {
    await runTestFile(
      api,
      `
'test'
func('foo')    
'test'
---
# foo
`,
    );

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('test\r\ntest\r\n', false);
  });

  test('complex example from wiki', async () => {
    await runTestFile(
      api,
      `*P '1'
      $txt = $MAINTXT
      *PL '23'
      *NL '456'
      '78'`,
    );

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('123\r\n\r\n45678\r\n', false);
    expect(api.readVariable('$txt')).toBe('1');
  });
});
