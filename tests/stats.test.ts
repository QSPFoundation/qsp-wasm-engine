import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';
import { QspPanel } from '../src';

describe('stats panel', () => {
  let api: QspAPI;
  let error: Mock;
  let statsChanged: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
    statsChanged = jest.fn();
    api.on('stats_changed', statsChanged);
  });

  test('p should print text without line break', async () => {
    runTestFile(api, `p 'works'`);
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works');
  });

  test('pl should print text with line break', async () => {
    runTestFile(api, `pl 'works'`);
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works\r\n');
  });

  test('nl should print text with line break in front', async () => {
    runTestFile(api, `nl 'works'`);
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('\r\nworks');
  });

  test('CLEAR should clear main description', async () => {
    runTestFile(api, `p 'works'`);
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works');
    api.execCode('CLEAR');
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledTimes(2);
    expect(statsChanged).toHaveBeenCalledWith('');
  });

  test('CLR should clear main description', async () => {
    runTestFile(api, `p 'works'`);
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works');
    api.execCode('CLR');
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledTimes(2);
    expect(statsChanged).toHaveBeenCalledWith('');
  });

  test('$STATTXT should return text from main panel', async () => {
    runTestFile(api, `p 'works' & $text =  $STATTXT`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableString('$text')).toBe('works');
  });

  test('SHOWSTAT should change panel visibility', () => {
    const panelVisibilityChanged = jest.fn()
    api.on('panel_visibility', panelVisibilityChanged);
    runTestFile(api, `SHOWSTAT 0`);
    expect(panelVisibilityChanged).toHaveBeenCalledWith(QspPanel.VARS, 0);
  })
});
