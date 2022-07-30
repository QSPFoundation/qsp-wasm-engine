import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';
import { readQsps, writeQsp } from '@qsp/converters';

describe('objects', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('OPENQST', () => {
    const onOpen = jest.fn();
    api.on('open_game', onOpen);
    runTestFile(api, `x = 1 & OPENQST '1.qsp' & x = 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(1);
    expect(onOpen).toHaveBeenCalledWith('1.qsp', 1, expect.any(Function));
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onOpen.mock.calls[0][2] as Function)();
    expect(api.readVariable('x')).toBe(1);
    expect(error).not.toHaveBeenCalled();
  });

  test('INCLIB', () => {
    const onOpen = jest.fn();
    api.on('open_game', onOpen);
    runTestFile(api, `x = 1 & INCLIB '1.qsp' & x = 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(1);
    expect(onOpen).toHaveBeenCalledWith('1.qsp', 0, expect.any(Function));
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onOpen.mock.calls[0][2] as Function)();
    expect(api.readVariable('x')).toBe(2);
    expect(error).not.toHaveBeenCalled();
  });

  test('FREELIB', () => {
    const onOpen = jest.fn();
    api.on('open_game', onOpen);
    runTestFile(api, `l = loc('other') & INCLIB '1.qsp'`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('l')).toBe(0);
    expect(onOpen).toHaveBeenCalledWith('1.qsp', 0, expect.any(Function));
    api.openGame(writeQsp(readQsps(`# other
---`)), false);
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onOpen.mock.calls[0][2] as Function)();
    api.execCode(`l = loc('other')`);
    expect(api.readVariable('l')).toBe(1);
    api.execCode('FREELIB');
    api.execCode(`l = loc('other')`);
    expect(api.readVariable('l')).toBe(0);
    expect(error).not.toHaveBeenCalled();
  });

  test('SAVEGAME', () => {
    const onSave = jest.fn();
    api.on('save_game', onSave);
    runTestFile(api, `x = 1 & SAVEGAME '1.sav' & x = 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(1);
    expect(onSave).toHaveBeenCalledWith('1.sav', expect.any(Function));
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onSave.mock.calls[0][1] as Function)();
    expect(api.readVariable('x')).toBe(2);
    expect(error).not.toHaveBeenCalled();
  });

  test('OPENGAME', () => {
    const onLoad = jest.fn();
    api.on('load_save', onLoad);
    runTestFile(api, `x = 1 & OPENGAME '1.sav' & x = 2`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(1);
    expect(onLoad).toHaveBeenCalledWith('1.sav', expect.any(Function));
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onLoad.mock.calls[0][1] as Function)();
    expect(api.readVariable('x')).toBe(2);
    expect(error).not.toHaveBeenCalled();
  });
});
