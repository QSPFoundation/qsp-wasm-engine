import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';
import { QspPanel } from '../../src';

describe('stats panel', () => {
  let api: QspAPI;
  let error: Mock;
  let statsChanged: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('p should print text without line break', async () => {
    await runTestFile(api, `p 'works'`);

    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works');
  });

  test('pl should print text with line break', async () => {
    await runTestFile(api, `pl 'works'`);

    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works\r\n');
  });

  test('nl should print text with line break in front', async () => {
    await runTestFile(api, `nl 'works'`);

    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('\r\nworks');
  });

  test('CLEAR should clear stats description', async () => {
    await runTestFile(api, `p 'works'`);

    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works');

    api.execCode('CLEAR');

    expect(statsChanged).toHaveBeenCalledTimes(2);
    expect(statsChanged).toHaveBeenCalledWith('');
  });

  test('CLR should clear stats description', async () => {
    await runTestFile(api, `p 'works'`);

    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works');

    api.execCode('CLR');

    expect(statsChanged).toHaveBeenCalledTimes(2);
    expect(statsChanged).toHaveBeenCalledWith('');
  });

  test('CLS should clear stats description', async () => {
    await runTestFile(api, `p 'works'`);

    expect(statsChanged).toHaveBeenCalledTimes(1);
    expect(statsChanged).toHaveBeenCalledWith('works');
    
    api.execCode('CLS');

    expect(statsChanged).toHaveBeenCalledTimes(2);
    expect(statsChanged).toHaveBeenCalledWith('');
  });

  test('$STATTXT should return text from stats panel', async () => {
    await runTestFile(api, `p 'works' & $text = $STATTXT`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('$STATTXT() should return text from stats panel', async () => {
    await runTestFile(api, `p 'works' & $text = $STATTXT()`);

    expect(api.readVariable('$text')).toBe('works');
  });

  test('SHOWSTAT should change panel visibility', async () => {
    const panelVisibilityChanged = vi.fn();
    api.on('panel_visibility', panelVisibilityChanged);
    await runTestFile(api, `SHOWSTAT 0`);
    expect(panelVisibilityChanged).toHaveBeenCalledWith(QspPanel.VARS, false);

    api.execCode(`SHOWSTAT 1`);
    expect(panelVisibilityChanged).toHaveBeenCalledWith(QspPanel.VARS, true);
  });
});
