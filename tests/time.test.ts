import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('time', () => {
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

  test('WAIT should trigger wait event', () => {
    const onWait = vi.fn();
    api.on('wait', onWait);
    runTestFile(api, `WAIT 1000`);

    expect(onWait).toHaveBeenCalledWith(1000, expect.any(Function));
    onWait.mock.calls[0][1]();
  });

  test('WAIT should pause execution', () => {
    const onWait = vi.fn();
    api.on('wait', onWait);
    const onStatsChanged = vi.fn();
    api.on('stats_changed', onStatsChanged);
    runTestFile(api, `pl 'before wait' & WAIT 1000 & p 'after wait'`);
    expect(onStatsChanged).toHaveBeenCalledWith('before wait\r\n');
    expect(onWait).toHaveBeenCalledWith(1000, expect.any(Function));
    onWait.mock.calls[0][1]();
    expect(onStatsChanged).toHaveBeenCalledWith('before wait\r\nafter wait');
  });

  test.only('MSECSCOUNT should return msec passed from game start', async () => {
    vi.useFakeTimers();

    api = await prepareApi();
    api.on('error', error);
    runTestFile(api, `res = MSECSCOUNT`);

    expect(api.readVariable('res')).toBe(0);

    vi.advanceTimersByTime(2000);

    api.execCode(`res = MSECSCOUNT`);

    expect(api.readVariable('res')).toBe(2000);

    vi.useRealTimers();
  });

  test('SETTIMER should change counter frequency', () => {
    const onTimer = vi.fn();
    api.on('timer', onTimer);
    runTestFile(api, `SETTIMER 100`);

    expect(onTimer).toHaveBeenCalledWith(100);
  });

  test('counter location should be called', () => {
    const onStatsChanged = vi.fn();
    api.on('stats_changed', onStatsChanged);
    runTestFile(
      api,
      `
$counter = 'counter'
---
#counter
p 'works'
`,
    );

    api.execCounter();
    expect(onStatsChanged).toHaveBeenCalledWith('works');
    api.execCounter();
    expect(onStatsChanged).toHaveBeenCalledWith('worksworks');
  });

  test('several counters should be supported', () => {
    const onStatsChanged = vi.fn();
    api.on('stats_changed', onStatsChanged);
    runTestFile(
      api,
      `
$counter = 'counter'
$counter[] = 'counter_other'
---
#counter
p 'works'
-- 
#counter_other
p ' & works other'
`,
    );

    api.execCounter();
    expect(onStatsChanged).toHaveBeenCalledWith('works & works other');
  });
});
