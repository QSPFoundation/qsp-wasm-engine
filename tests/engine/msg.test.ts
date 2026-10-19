import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, startTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('MSG', () => {
  let api: QspAPI;
  let error: Mock;
  let msg: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    msg = vi.fn();
    api.on('msg', msg);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('MSG should trigger event in api', async () => {
    const { done } = await startTestFile(api, `msg 'works'`);

    expect(msg).toHaveBeenCalledWith('works', expect.any(Function));
    msg.mock.calls[0][1]();
    await done;
  });

  test('msg should stop execution flow', async () => {
    const mainChanged = vi.fn();
    api.on('main_changed', mainChanged);
    const { done } = await startTestFile(api, `*p '1' & msg 'works' & *p '2'`);
    expect(mainChanged).toHaveBeenCalledWith('1', false);
    expect(msg).toHaveBeenCalledWith('works', expect.any(Function));
    msg.mock.calls[0][1]();
    await done;
    expect(mainChanged).toHaveBeenCalledWith('12', false);
  });
});
