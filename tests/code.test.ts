import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('misc code', () => {
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

  test('long line split', () => {
    runTestFile(
      api,
      `
t = 1
tort = 0
if t _
   or _
   t:
  $type = 'new'
else
  $type = 'old'
end
    `,
    );

    expect(api.readVariable('$type')).toBe('new');
  });
});
