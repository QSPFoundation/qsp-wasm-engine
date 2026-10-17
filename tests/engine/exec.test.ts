import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, nextTick } from '../../src/test-helpers';
import { QspAPI } from '../../src';

describe('exec', () => {
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

  it('should trigger callback', () => {
    const onSystemCmd = vi.fn();
    api.on('system_cmd', onSystemCmd);

    runTestFile(api, `exec('test')`);


    expect(onSystemCmd).toHaveBeenCalledWith('test');
  });

  it('should update ui on call', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);

    runTestFile(api, `*p 'before' & exec('test') & *p '-after'`);

    expect(onMain).toHaveBeenCalledTimes(2);
    expect(onMain).toHaveBeenCalledWith('before', false);
    expect(onMain).toHaveBeenCalledWith('before-after', false);
  });

  it('should wait for the promise returned by the listener', async () => {
    api.on('system_cmd', async (cmd) => {
      expect(cmd).toBe('wait');
      await nextTick();
      await api.execCode('inner = 1');
    });

    await runTestFile(api, `exec('wait') & after = inner`);

    expect(api.readVariable('after')).toBe(1);
  });

  it('should not wait for the listeners which return nothing', async () => {
    api.on('system_cmd', () => {});

    await runTestFile(api, `exec('test') & after = 1`);

    expect(api.readVariable('after')).toBe(1);
  });

  it('should continue when the promise of the listener is rejected', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.on('system_cmd', () => Promise.reject(new Error('failed')));

    await runTestFile(api, `exec('test') & after = 1`);

    expect(api.readVariable('after')).toBe(1);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
