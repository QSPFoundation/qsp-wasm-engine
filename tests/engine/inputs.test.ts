import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, startTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';
import { QspPanel } from '../../src';

describe('user inputs panel', () => {
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

  test('SHOWINPUT should toggle user cmd visibility', async () => {
    const onPanelVisibility = vi.fn();
    api.on('panel_visibility', onPanelVisibility);
    await runTestFile(api, `SHOWINPUT 0`);

    expect(onPanelVisibility).toHaveBeenCalledWith(QspPanel.INPUT, false);

    api.execCode(`SHOWINPUT 1`);
    expect(onPanelVisibility).toHaveBeenCalledWith(QspPanel.INPUT, true);
  });

  test('USER_TEXT should return text from user cmd', async () => {
    api.updateUserInput('works');
    await runTestFile(api, `$text = USER_TEXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('USRTXT should return text from user cmd', async () => {
    api.updateUserInput('works');
    await runTestFile(api, `$text = USRTXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('CMDCLEAR should clear user input', async () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    await runTestFile(api, `$textBefore = USRTXT & CMDCLEAR & $textAfter = USRTXT`);

    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('CMDCLR should clear user input', async () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    await runTestFile(api, `$textBefore = USRTXT & CMDCLR & $textAfter = USRTXT`);

    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('CLS should clear user input', async () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    await runTestFile(api, `$textBefore = USRTXT & CLS & $textAfter = USRTXT`);

    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('INPUT should interrupt execution flow and receive entered text', async () => {
    const onInput = vi.fn();
    api.on('input', onInput);
    const mainChanged = vi.fn();
    api.on('main_changed', mainChanged);
    const { done } = await startTestFile(api, `*p '1' & $text = $input('Question?') & *p '2'`);
   
    expect(mainChanged).toHaveBeenCalledWith('1', false);
    expect(onInput).toHaveBeenCalledWith('Question?', expect.any(Function));

    onInput.mock.calls[0][1]('Answer');
    await done;
    expect(api.readVariable('$text')).toBe('Answer');
    expect(mainChanged).toHaveBeenCalledWith('12', false);
  });

  test('INPUT cuts the answer to 511 characters', async () => {
    const onInput = vi.fn();
    api.on('input', onInput);
    const { done } = await startTestFile(api, `$text = $input('Question?')`);

    onInput.mock.calls[0][1]('a'.repeat(600));
    await done;
    expect(api.readVariable('$text')).toBe('a'.repeat(511));
  });

  test('INPUT without an answer returns an empty string', async () => {
    const onInput = vi.fn();
    api.on('input', onInput);
    const { done } = await startTestFile(api, `$text = 'before' & $text = $input('Question?')`);

    onInput.mock.calls[0][1](undefined);
    await done;
    expect(api.readVariable('$text')).toBe('');
  });
});
