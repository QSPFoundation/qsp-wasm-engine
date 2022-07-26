import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('stats panel', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('VIEW with path', () => {
    const onView = jest.fn();
    api.on('view', onView);
    runTestFile(api, `VIEW '1.png'`);
    expect(error).not.toHaveBeenCalled();
    expect(onView).toHaveBeenCalledWith('1.png');
  });

  test('VIEW without path', () => {
    const onView = jest.fn();
    api.on('view', onView);
    runTestFile(api, `VIEW`);
    expect(error).not.toHaveBeenCalled();
    expect(onView).toHaveBeenCalledWith('');
  });

  test('REFINT', () => {
    const mainChanged = jest.fn();
    api.on('main_changed', mainChanged);
    const statsChanged = jest.fn();
    api.on('stats_changed', statsChanged);
    const actsChanged = jest.fn();
    api.on('actions_changed', actsChanged);
    const objsChanged = jest.fn();
    api.on('objects_changed', objsChanged);
    api.execCode('REFINT');

    expect(error).not.toHaveBeenCalled();
    expect(mainChanged).toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalled();
    expect(objsChanged).toHaveBeenCalled();
  });

  test('RGB', () => {
    runTestFile(api, `x = RGB(16, 32, 64)`)
    expect(api.readVariable('x')).toBe(-12574704);
  })

  test('RGB with alpha', () => {
    runTestFile(api, `x = RGB(16, 32, 64, 128)`)
    expect(api.readVariable('x')).toBe(-2143281136);
  })
});
