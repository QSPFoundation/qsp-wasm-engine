import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('stats panel', () => {
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

  test('VIEW with path', () => {
    const onView = vi.fn();
    api.on('view', onView);
    runTestFile(api, `VIEW '1.png'`);

    expect(onView).toHaveBeenCalledWith('1.png');
  });

  test('VIEW without path', () => {
    const onView = vi.fn();
    api.on('view', onView);
    runTestFile(api, `VIEW`);

    expect(onView).toHaveBeenCalledWith('');
  });

  test('REFINT', () => {
    const mainChanged = vi.fn();
    api.on('main_changed', mainChanged);
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    const actsChanged = vi.fn();
    api.on('actions_changed', actsChanged);
    const objsChanged = vi.fn();
    api.on('objects_changed', objsChanged);
    api.execCode('REFINT');


    expect(mainChanged).toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalled();
    expect(objsChanged).toHaveBeenCalled();
  });

  test('RGB', () => {
    runTestFile(api, `x = RGB(16, 32, 64)`);
    expect(api.readVariable('x')).toBe(-12574704);
  });

  test('RGB with alpha', () => {
    runTestFile(api, `x = RGB(16, 32, 64, 128)`);
    expect(api.readVariable('x')).toBe(-2143281136);
  });
});
