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

  test('error', () => {
    
  })
});
