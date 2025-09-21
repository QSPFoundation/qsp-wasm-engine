import { afterEach, beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src';

describe('Memory leaks', () => {
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

  test('no leak on dynamic with error', () => {
    runTestFile(
      api,
      `
      dynamic '$bug="<<434+>>"'
      dynamic '$bug="<<434+1>>"'
      $bug
      `,
    );
    expect(error).toHaveBeenCalled();
    error.mockReset();
  });

  test('no leak on tuple unpack', () => {
    api.execCode("local ,='4','5'");

    expect(error).toHaveBeenCalled();
    error.mockReset();
  });
});
