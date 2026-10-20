import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, startTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('time', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('WAIT should trigger wait event', async () => {
    const onWait = vi.fn();
    api.on('wait', onWait);
    const { done } = await startTestFile(api, `WAIT 1000`);

    expect(onWait).toHaveBeenCalledWith(1000, expect.any(Function));
    onWait.mock.calls[0][1]();
    await done;
  });

  test('WAIT should pause execution', async () => {
    const onWait = vi.fn();
    api.on('wait', onWait);
    const onStatsChanged = vi.fn();
    api.on('stats_changed', onStatsChanged);
    const { done } = await startTestFile(api, `pl 'before wait' & WAIT 1000 & p 'after wait'`);
    expect(onStatsChanged).toHaveBeenCalledWith('before wait\r\n');
    expect(onWait).toHaveBeenCalledWith(1000, expect.any(Function));
    onWait.mock.calls[0][1]();
    await done;
    expect(onStatsChanged).toHaveBeenCalledWith('before wait\r\nafter wait');
  });

  test('MSECSCOUNT should return msec passed from game start', async () => {
    vi.useFakeTimers();

    api = await prepareApi();
    api.on('error', error);
    await runTestFile(api, `res = MSECSCOUNT`);

    expect(api.readVariable('res')).toBe(0);

    vi.advanceTimersByTime(2000);

    api.execCode(`res = MSECSCOUNT`);

    expect(api.readVariable('res')).toBe(2000);

    vi.useRealTimers();
  });

  test('SETTIMER should change counter frequency', async () => {
    const onTimer = vi.fn();
    api.on('timer', onTimer);
    await runTestFile(api, `SETTIMER 100`);

    expect(onTimer).toHaveBeenCalledWith(100);
  });

  test('counter location should be called', async () => {
    const onStatsChanged = vi.fn();
    api.on('stats_changed', onStatsChanged);
    await runTestFile(
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

  test('several counters should be supported', async () => {
    const onStatsChanged = vi.fn();
    api.on('stats_changed', onStatsChanged);
    await runTestFile(
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
