import { Mock, beforeEach, describe, vi, it, expect } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// TODO add save/load test
describe('api', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  it('should read numeric variable', async () => {
    runTestFile(api, `test = 254`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('test')).toBe(254);
  });
  it('should read numeric variable by index', async () => {
    runTestFile(api, `test[2] = 254`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('test', 2)).toBe(254);
  });
  it('should read numeric variable by key', () => {
    runTestFile(api, `test[0] = 11 & test['test'] = 254`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('test', 'test')).toBe(254);
  });

  it('should read numeric variable by cyrillic key', () => {
    runTestFile(api, `test[0] = 11 & test['тест'] = 254`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('test', 'тест')).toBe(254);
  });

  it('should read numeric variable in cyrilic', async () => {
    runTestFile(api, `тест = 254`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('тест')).toBe(254);
  });

  it('should read string variable', async () => {
    runTestFile(api, `$test = '254'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$test')).toBe('254');
  });
  it('should read string variable by index', async () => {
    runTestFile(api, `$test[2] = '254'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$test', 2)).toBe('254');
  });

  it('should read string variable by key', async () => {
    runTestFile(api, `$test['s'] = '254' & $test['test'] = '252'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('$test', 'test')).toBe('252');
  });

  it('should read string variable by cyrillic key', async () => {
    runTestFile(api, `$test['dd'] = '254' & $test['тест'] = '252'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableByKey('$test', 'тест')).toBe('252');
  });

  it('should read string variable in cyrilic', async () => {
    runTestFile(api, `$тест = '254'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$тест')).toBe('254');
  });

  it('should read varible size', () => {
    runTestFile(api, `test[100] = 1`);
    expect(error).not.toHaveBeenCalled();
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
    expect(api.version()).toEqual('5.8.0');
  });

  it('should watch variable by index', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    api.watchVariable('test', 1, watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith(0);
    api.execCode(`test[1] = 123`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith(123);
  });

  it('should see variable change before msg', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    const msg = vi.fn();
    api.on('msg', msg);

    api.watchVariable('test', 1, watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith(0);
    api.execCode(`test[1] = 123 & msg "test"`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith(123);
    // eslint-disable-next-line @typescript-eslint/ban-types
    (msg.mock.calls[0][1] as Function)();
  });

  it('should watch variable by key', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    api.watchVariableByKey('test', 'key', watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith(0);
    api.execCode(`test['key'] = 123`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith(123);
  });

  it('should watch expression', async () => {
    runTestFile(api, ``);
    const watchExpression = vi.fn();
    api.watchExpression('x > 0', watchExpression);
    await delay(10);
    expect(watchExpression).toHaveBeenCalledWith(0);
    watchExpression.mockReset();
    api.execCode('x = 5');
    await delay(10);
    expect(watchExpression).toHaveBeenCalledWith(1);
  });

  it('should not error when watching expressions with msg/input call', async () => {
    runTestFile(api, ``);
    const watchExpression = vi.fn();
    api.watchExpression('x > 0', watchExpression);
    await delay(10);
    expect(error).not.toHaveBeenCalled();
    api.execCode(`msg "test"`);
    expect(error).not.toHaveBeenCalled();
  });

  it('should not fail if watch expression is called when execution is paused (waiting for msg callback for example)', async () => {
    runTestFile(api, `x = 1`);
    const msg = vi.fn();
    api.on('msg', msg);
    const watchExpression = vi.fn();
    api.execCode(`'before' & msg "here" & 'after'`);

    expect(error).not.toHaveBeenCalled();

    api.watchExpression('x > 0', watchExpression);

    expect(error).not.toHaveBeenCalled();
    expect(watchExpression).not.toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/ban-types
    (msg.mock.calls[0][1] as Function)();
  
    await delay(10);
    expect(error).not.toHaveBeenCalled();
    expect(watchExpression).toHaveBeenCalledWith(1);
  });

  it('should not fail with watch expression and several updates with msg', async () => {
    runTestFile(api, `x = 1`);
    const msg = vi.fn();
    api.on('msg', msg);
    const watchExpression = vi.fn();
    api.watchExpression('x > 0', watchExpression);

    api.execCode(`'before' & msg "test 1" & 'between' & msg "test 2" & 'after'`);

    await delay(10);
    expect(error).not.toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/ban-types
    (msg.mock.calls[0][1] as Function)();
  
    await delay(10);
    expect(error).not.toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/ban-types
    (msg.mock.calls[1][1] as Function)();

    await delay(10);
    expect(error).not.toHaveBeenCalled();
    expect(watchExpression).toHaveBeenCalledWith(1);
  });
});
