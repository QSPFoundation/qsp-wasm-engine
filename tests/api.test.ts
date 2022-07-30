import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

// TODO add save/load test
describe('api', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
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
  })

  it('should exec code', () => {
    const statsChanged = jest.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(api, ``);
    expect(statsChanged).not.toHaveBeenCalled();
    api.execCode(`p 'works'`);
    expect(statsChanged).toHaveBeenCalledWith('works');
  });

  it('should read version', () => {
    expect(api.version()).toEqual('5.8.0');
  });

  it('should watch variables', () => {
    runTestFile(api, ``);
    const watchVariables = jest.fn();
    api.watchVariables(['test'], watchVariables);
    expect(watchVariables).toHaveBeenCalledWith({
      test: 0,
    });
    api.execCode(`test = 123`);
    expect(watchVariables).toHaveBeenCalledWith({
      test: 123,
    });
  });
});
