import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { delay, prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

// TODO add save/load test
describe('api', () => {
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


  it('should exec code', () => {
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(api, ``);
    expect(statsChanged).not.toHaveBeenCalled();
    api.execCode(`p 'works'`);
    expect(statsChanged).toHaveBeenCalledWith('works');
  });

  it('should read version', () => {
    expect(api.version()).toEqual('5.9.4');
  });

  it('should watch variable by index', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    api.watchVariableByIndex('$test', 1, watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('');
    api.execCode(`$test[1] = 'abc'`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('abc');
  });

  it('should see variable change before msg', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    const msg = vi.fn();
    api.on('msg', msg);

    api.watchVariableByIndex('$test', 1, watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('');
    api.execCode(`$test[1] = "ab" & msg "test"`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('ab');
    msg.mock.calls[0][1]();
  });

  it('should watch variable by key', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    api.watchVariableByKey('$test', 'key', watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('');
    api.execCode(`$test['key'] = "ab"`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('ab');
  });
});
