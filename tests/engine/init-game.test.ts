import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, nextTick } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('init game', () => {
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

  it('should be triggered when the game is restarted', async () => {
    const onInit = vi.fn();
    api.on('init_game', onInit);
    await runTestFile(api, `x = 1`);
    expect(onInit).not.toHaveBeenCalled();

    await api.restartGame();

    expect(onInit).toHaveBeenCalledTimes(1);
    expect(onInit).toHaveBeenCalledWith(true);
  });

  it('should be triggered when a saved game is loaded', async () => {
    const onInit = vi.fn();
    api.on('init_game', onInit);
    await runTestFile(api, `x = 1`);
    const save = await api.saveGame();
    if (!save) throw new Error('failed to save');

    await api.loadSave(save);

    expect(onInit).toHaveBeenCalledTimes(1);
    expect(onInit).toHaveBeenCalledWith(false);
  });

  it('should make the engine wait for the promise returned by the listener', async () => {
    api.on('init_game', async () => {
      await nextTick();
      await api.execCode('prepared = 1');
    });
    await runTestFile(api, `$ongload = 'loaded' & x = 1\n---\n# loaded\nseen = prepared`);
    const save = await api.saveGame();
    if (!save) throw new Error('failed to save');

    await api.loadSave(save);

    expect(api.readVariable('seen')).toBe(1);
  });
});
