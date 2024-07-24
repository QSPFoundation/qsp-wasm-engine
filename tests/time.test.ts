import { Mock, beforeEach, describe, vi, test, expect } from 'vitest';
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

  test('WAIT should trigger wait event', () => {
    const onWait = vi.fn();
    api.on('wait', onWait);
    runTestFile(api, `WAIT 1000`);
    expect(error).not.toHaveBeenCalled();
    expect(onWait).toHaveBeenCalledWith(1000, expect.any(Function));
  });

  test('WAIT should pause execution', () => {
    const onWait = vi.fn();
    api.on('wait', onWait);
    const onStatsChanged = vi.fn();
    api.on('stats_changed', onStatsChanged);
    runTestFile(api, `WAIT 1000 & p 'after wait'`);
    expect(onStatsChanged).toHaveBeenCalledWith('');
    expect(onWait).toHaveBeenCalledWith(1000, expect.any(Function));
    onWait.mock.calls[0][1]();
    expect(onStatsChanged).toHaveBeenCalledWith('after wait');
  });

  test.skip('MSECSCOUNT should return msec passed from game start', () => {
    // TODO find out way to test this
  });

  test('SETTIMER should change counter frequency', () => {
    const onTimer = vi.fn();
    api.on('timer', onTimer);
    runTestFile(api, `SETTIMER 100`);
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
    api.execCounter();
    expect(onStatsChanged).toHaveBeenCalledWith('works');
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
    expect(error).not.toHaveBeenCalled();
    api.execCounter();
    expect(onStatsChanged).toHaveBeenCalledWith('works & works other');
  });
});
