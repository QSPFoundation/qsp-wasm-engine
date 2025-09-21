import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';
import { readQsps, writeQsp } from '@qsp/converters';

describe('modules', () => {
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

  test('OPENQST', () => {
    const onOpen = vi.fn();
    api.on('open_game', onOpen);
    runTestFile(api, `x = 1 & OPENQST '1.qsp' & x = 2`);

    expect(api.readVariable('x')).toBe(1);
    expect(onOpen).toHaveBeenCalledWith('1.qsp', 1, expect.any(Function));
    onOpen.mock.calls[0][2]();
    expect(api.readVariable('x')).toBe(1);
  });

  test('INCLIB should add module', () => {
    const onOpen = vi.fn();
    api.on('open_game', onOpen);
    runTestFile(api, `x = 1 & INCLIB '1.qsp' & x = 2`);

    expect(api.readVariable('x')).toBe(1);
    expect(onOpen).toHaveBeenCalledWith('1.qsp', 0, expect.any(Function));

    api.openGame(
      writeQsp(
        readQsps(`# other
---`),
      ),
      false,
    );
    onOpen.mock.calls[0][2]();
    api.execCode(`has_other = loc('other')`);

    expect(api.readVariable('x')).toBe(2);
    expect(api.readVariable('has_other')).toBe(1);
  });

  test('FREELIB', () => {
    const onOpen = vi.fn();
    api.on('open_game', onOpen);
    runTestFile(api, `l = loc('other') & INCLIB '1.qsp'`);

    expect(api.readVariable('l')).toBe(0);
    expect(onOpen).toHaveBeenCalledWith('1.qsp', 0, expect.any(Function));
    api.openGame(
      writeQsp(
        readQsps(`# other
---`),
      ),
      false,
    );
    onOpen.mock.calls[0][2]();
    api.execCode(`l = loc('other')`);
    expect(api.readVariable('l')).toBe(1);
    api.execCode('FREELIB');
    api.execCode(`l = loc('other')`);
    expect(api.readVariable('l')).toBe(0);
  });

  test('SAVEGAME with save name', () => {
    const onSave = vi.fn();
    api.on('save_game', onSave);
    runTestFile(api, `x = 1 & SAVEGAME '1.sav' & x = 2`);

    expect(api.readVariable('x')).toBe(1);
    expect(onSave).toHaveBeenCalledWith('1.sav', expect.any(Function));
    onSave.mock.calls[0][1]();
    expect(api.readVariable('x')).toBe(2);
  });

  test('SAVEGAME without save name', () => {
    const onSave = vi.fn();
    api.on('save_game', onSave);
    runTestFile(api, `x = 1 & SAVEGAME & x = 2`);

    expect(api.readVariable('x')).toBe(1);
    expect(onSave).toHaveBeenCalledWith('', expect.any(Function));
    onSave.mock.calls[0][1]();
    expect(api.readVariable('x')).toBe(2);
  });

  test('OPENGAME with save name', () => {
    const onLoad = vi.fn();
    api.on('load_save', onLoad);
    runTestFile(api, `x = 1 & OPENGAME '1.sav' & x = 2`);

    expect(api.readVariable('x')).toBe(1);
    expect(onLoad).toHaveBeenCalledWith('1.sav', expect.any(Function));
    onLoad.mock.calls[0][1]();
    expect(api.readVariable('x')).toBe(2);
  });

  test('OPENGAME without save name', () => {
    const onLoad = vi.fn();
    api.on('load_save', onLoad);
    runTestFile(api, `x = 1 & OPENGAME & x = 2`);

    expect(api.readVariable('x')).toBe(1);
    expect(onLoad).toHaveBeenCalledWith('', expect.any(Function));
    onLoad.mock.calls[0][1]();
    expect(api.readVariable('x')).toBe(2);
  });
});
