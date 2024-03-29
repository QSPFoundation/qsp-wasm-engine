import { Mock, beforeEach, describe, vi, test, expect } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';
import { QspPanel } from '../src';

describe('Main panel', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });

  test('SHOWINPUT should toggle user cmd visibility', () => {
    const onPanelVisibility = vi.fn();
    api.on('panel_visibility', onPanelVisibility);
    runTestFile(api, `SHOWINPUT 0`);
    expect(error).not.toHaveBeenCalled();
    expect(onPanelVisibility).toHaveBeenCalledWith(QspPanel.INPUT, 0);
  });

  test('USER_TEXT should return text from user cmd', () => {
    api.updateUserInput('works');
    runTestFile(api, `$text = USER_TEXT`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$text')).toBe('works');
  });

  test('USRTXT should return text from user cmd', () => {
    api.updateUserInput('works');
    runTestFile(api, `$text = USRTXT`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$text')).toBe('works');
  });

  test('CMDCLEAR should return text from user cmd', () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    runTestFile(api, `$textBefore = USRTXT & CMDCLEAR & $textAfter = USRTXT`);
    expect(error).not.toHaveBeenCalled();
    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('CMDCLR should return text from user cmd', () => {
    const userInput = vi.fn();
    api.on('user_input', userInput);
    api.updateUserInput('works');
    runTestFile(api, `$textBefore = USRTXT & CMDCLR & $textAfter = USRTXT`);
    expect(error).not.toHaveBeenCalled();
    expect(userInput).toHaveBeenCalledWith('');
    expect(api.readVariable('$textBefore')).toBe('works');
    expect(api.readVariable('$textAfter')).toBe('');
  });

  test('INPUT should interrupt execution flow and receive entered text', () => {
    const onInput = vi.fn();
    api.on('input', onInput);
    runTestFile(api, `$text = $input('Question?')`);
    expect(error).not.toHaveBeenCalled();
    expect(onInput).toHaveBeenCalledWith('Question?', expect.any(Function));
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onInput.mock.calls[0][1] as Function)('Answer');
    expect(api.readVariable('$text')).toBe('Answer');
  });
});
