import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('conditionals', () => {
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

  test('JUMP', () => {
    runTestFile(
      api,
      `
x = 1 & y = 1
jump 'end'
x = 2
:end
if x = 1: y = 2
    `,
    );

    expect(api.readVariable('y')).toBe(2);
  });

  test('jump loops', () => {
    const onStat = vi.fn();
    api.on('stats_changed', onStat);
    runTestFile(
      api,
      `
s=0
:loop
if s<9:
  s+=1
  p s
  jump 'loop'
end`,
    );

    expect(onStat).toHaveBeenCalledWith('123456789');
  });
});
