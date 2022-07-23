import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

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
    expect(api.readVariableNumber('test')).toBe(254);
  });
  it('should read numeric variable by index', async () => {
    runTestFile(api, `test[2] = 254`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableNumber('test', 2)).toBe(254);
  });

  it('should read numeric variable in cyrilic', async () => {
    runTestFile(api, `тест = 254`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableNumber('тест')).toBe(254);
  });

  it('should read string variable', async () => {
    runTestFile(api, `$test = '254'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableString('$test')).toBe('254');
  });
  it('should read numeric variable by index', async () => {
    runTestFile(api, `$test[2] = '254'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableString('$test', 2)).toBe('254');
  });

  it('should read numeric variable in cyrilic', async () => {
    runTestFile(api, `$тест = '254'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableString('$тест')).toBe('254');
  });

  it('should exec code', () => {
    const statsChanged = jest.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(api, ``);
    expect(statsChanged).not.toHaveBeenCalled();
    api.execCode(`p 'works'`);
    expect(statsChanged).toHaveBeenCalledWith('works');
  });

  it('should read version', () => {
    expect(api.version()).toEqual('5.8.0')
  });

  it('should watch variables', () => {
    runTestFile(api, ``);
    const watchVariables = jest.fn();
    api.watchVariables(['test'], watchVariables);
    expect(watchVariables).toHaveBeenCalledWith({
      test: 0
    });
    api.execCode(`test = 123`);
    expect(watchVariables).toHaveBeenCalledWith({
      test: 123
    });
  })
});
