import { afterEach, beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src';

describe('Main panel', () => {
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

  test.skip('no leak on dynamic with error', () => {
    runTestFile(
      api,
      `
      dynamic '$bug="<<434+>>"'
      dynamic '$bug="<<434+1>>"'
      $bug
      `,
    );
    expect(error).toHaveBeenCalled();
  });

  test("no leak on exec expression", () => {
    api.execExpression("x = 1");

    expect(api.readVariable('x')).toBe(1);
  })
});
