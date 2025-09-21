import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';
import { QspPanel } from '../src';

describe('user inputs panel', () => {
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

  test('SHOWINPUT should toggle user cmd visibility', () => {
    const onPanelVisibility = vi.fn();
    api.on('panel_visibility', onPanelVisibility);
    runTestFile(api, `SHOWINPUT 0`);

    expect(onPanelVisibility).toHaveBeenCalledWith(QspPanel.INPUT, 0);

    api.execCode(`SHOWINPUT 1`);
    expect(onPanelVisibility).toHaveBeenCalledWith(QspPanel.INPUT, 1);
  });

  test('USER_TEXT should return text from user cmd', () => {
    api.updateUserInput('works');
    runTestFile(api, `$text = USER_TEXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('USRTXT should return text from user cmd', () => {
    api.updateUserInput('works');
    runTestFile(api, `$text = USRTXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('CMDCLEAR should clear user input', () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    runTestFile(api, `$textBefore = USRTXT & CMDCLEAR & $textAfter = USRTXT`);

    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('CMDCLR should clear user input', () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    runTestFile(api, `$textBefore = USRTXT & CMDCLR & $textAfter = USRTXT`);

    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('CLS should clear user input', () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    runTestFile(api, `$textBefore = USRTXT & CLS & $textAfter = USRTXT`);

    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('INPUT should interrupt execution flow and receive entered text', () => {
    const onInput = vi.fn();
    api.on('input', onInput);
    const mainChanged = vi.fn();
    api.on('main_changed', mainChanged);
    runTestFile(api, `*p '1' & $text = $input('Question?') & *p '2'`);
   
    expect(mainChanged).toHaveBeenCalledWith('1', false);
    expect(onInput).toHaveBeenCalledWith('Question?', expect.any(Function));

    onInput.mock.calls[0][1]('Answer');
    expect(api.readVariable('$text')).toBe('Answer');
    expect(mainChanged).toHaveBeenCalledWith('12', false);
  });
});
