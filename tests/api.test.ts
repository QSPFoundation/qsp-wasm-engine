import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { delay, prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

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

  it('should read numeric variable', async () => {
    runTestFile(api, `test = 254`);

    expect(api.readVariable('test')).toBe(254);
  });
  it('should read numeric variable by index', async () => {
    runTestFile(api, `test[2] = 254`);

    expect(api.readVariableByIndex('test', 2)).toBe(254);
  });
  it('should read numeric variable by key', () => {
    runTestFile(api, `test[0] = 11 & test['test'] = 254`);

    expect(api.readVariableByKey('test', 'test')).toBe(254);
  });

  it('should read numeric variable by cyrillic key', () => {
    runTestFile(api, `test[0] = 11 & test['тест'] = 254`);

    expect(api.readVariableByKey('test', 'тест')).toBe(254);
  });

  it('should read numeric variable in cyrillic', async () => {
    runTestFile(api, `тест = 254`);

    expect(api.readVariable('тест')).toBe(254);
  });

  it('should read string variable', async () => {
    runTestFile(api, `$test = '254'`);

    expect(api.readVariable('$test')).toBe('254');
  });
  it('should read string variable by index', async () => {
    runTestFile(api, `$test[2] = '254'`);

    expect(api.readVariableByIndex('$test', 2)).toBe('254');
  });

  it('should read string variable by key', async () => {
    runTestFile(api, `$test['s'] = '254' & $test['test'] = '252'`);

    expect(api.readVariableByKey('$test', 'test')).toBe('252');
  });

  it('should read string variable by cyrillic key', async () => {
    runTestFile(api, `$test['dd'] = '254' & $test['тест'] = '252'`);

    expect(api.readVariableByKey('$test', 'тест')).toBe('252');
  });

  it('should read string variable in cyrillic', async () => {
    runTestFile(api, `$тест = '254'`);

    expect(api.readVariable('$тест')).toBe('254');
  });

  it('should read tuple variable', () => {
    runTestFile(api, `%test = ['a', 'b']`);

    expect(api.readVariable('%test')).toEqual(['a', 'b']);
  });

  it('should read tuple variable by index', () => {
    runTestFile(api, `%test[1] = ['b']`);

    expect(api.readVariableByIndex('%test', 1)).toEqual(['b']);
  });

  it('should read tuple variable by key', () => {
    runTestFile(api, `%test['s'] = ['b']`);

    expect(api.readVariableByKey('%test', 's')).toEqual(['b']);
  });

  it('should read variable size', () => {
    runTestFile(api, `test[100] = 1`);

    expect(api.readVariableSize('test')).toBe(101);
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
    expect(api.version()).toEqual('5.9.1');
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
