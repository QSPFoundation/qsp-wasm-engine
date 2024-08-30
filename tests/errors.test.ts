import { afterEach, beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { QspAPI } from '../src';
import { prepareApi, runTestFile } from '../src/test-helpers';

describe('errors', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api._cleanup();
    api?._run_checks();
  });

  test('error jump from action', () => {
    runTestFile(
      api,
      `
act '1': x = 1 & jump 'end'
:end
  `,
    );

    api.selectAction(0);
    api.execSelectedAction();
    expect(api.readVariable('x')).toBe(1);
    expect(error).toHaveBeenCalledWith({
      actionIndex: -1,
      errorCode: 112,
      description: 'Label not found!',
      line: 2,
      localLine: 2,
      lineSrc: " X = 1 & JUMP 'end'",
      location: 'test',
    });
  });

  test('error jump from dynamic', () => {
    runTestFile(
      api,
      `
dynamic { x = 1 & jump 'end' }
:end
  `,
    );
    expect(api.readVariable('x')).toBe(1);
    expect(error).toHaveBeenCalledWith({
      actionIndex: -1,
      errorCode: 112,
      description: 'Label not found!',
      line: 2,
      localLine: 1,
      lineSrc: "X = 1 & JUMP 'end'",
      location: 'test',
    });
  });
});
