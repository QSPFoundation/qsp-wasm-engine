import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src';

describe('exec', () => {
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
});
