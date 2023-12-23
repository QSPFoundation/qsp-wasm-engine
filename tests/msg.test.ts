import { Mock, beforeEach, describe, vi, test, expect } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('MSG', () => {
  let api: QspAPI;
  let error: Mock;
  let msg: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    msg = vi.fn();
    api.on('msg', msg);
  });

  test('MSG should trigger event in api', () => {
    runTestFile(api, `msg 'works'`);
    expect(error).not.toHaveBeenCalled();
    expect(msg).toHaveBeenCalledWith('works', expect.any(Function));
  });

  test('msg should stop execution flow', () => {
    const mainChanged = vi.fn();
    api.on('main_changed', mainChanged);
    runTestFile(api, `*p 1 & msg 'works' & *p 2`);
    expect(mainChanged).toHaveBeenCalledWith('1');
    expect(msg).toHaveBeenCalledWith('works', expect.any(Function));
    // eslint-disable-next-line @typescript-eslint/ban-types
    (msg.mock.calls[0][1] as Function)();
    expect(mainChanged).toHaveBeenCalledWith('12');
  });
});
