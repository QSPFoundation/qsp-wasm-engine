import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

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
    api._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('*p should print text without line break', async () => {
    runTestFile(api, `*p 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works');
  });

  test('*pl should print text with line break', async () => {
    runTestFile(api, `*pl 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works\r\n');
  });

  test('*nl should print text with line break in front', async () => {
    runTestFile(api, `*nl 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('\r\nworks');
  });

  test('$MAINTXT should return text from main panel', async () => {
    runTestFile(api, `*p 'works' & $text = $MAINTXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('$MAINTXT() should return text from main panel', async () => {
    runTestFile(api, `*p 'works' & $text = $MAINTXT()`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('*CLEAR should clear main description', async () => {
    runTestFile(api, `*p 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works');
    api.execCode('*CLEAR');

    expect(mainChanged).toHaveBeenCalledTimes(2);
    expect(mainChanged).toHaveBeenCalledWith('');
  });

  test('*CLR should clear main description', async () => {
    runTestFile(api, `*p 'works'`);

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('works');
    api.execCode('*CLR');

    expect(mainChanged).toHaveBeenCalledTimes(2);
    expect(mainChanged).toHaveBeenCalledWith('');
  });

  test('implicit output', async () => {
    runTestFile(
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
    expect(mainChanged).toHaveBeenCalledWith('test\r\ntest\r\n');
  });

  test('complex example from wiki', () => {
    runTestFile(
      api,
      `*P '1'
      $txt = $MAINTXT
      *PL '23'
      *NL '456'
      '78'`,
    );

    expect(mainChanged).toHaveBeenCalledTimes(1);
    expect(mainChanged).toHaveBeenCalledWith('123\r\n\r\n45678\r\n');
    expect(api.readVariable('$txt')).toBe('1');
  });
});
