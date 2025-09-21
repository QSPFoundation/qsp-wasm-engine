import { Mock, beforeEach, describe, vi, expect, it, afterEach } from 'vitest';
import { DebugRecord, QspAPI } from '../../src';
import { prepareApi, runTestFile } from '../../src/test-helpers';

describe.skip('debug', () => {
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


  it('should report every line in loc when debug is on', () => {
    const data: DebugRecord[] = [];
    api.on('debug', (record, resume) => {
      data.push(record);
      resume();
    });

    api.enableDebugMode();

    runTestFile(
      api,
      `'first line'
      a = 10
'third line'`,
    );

    api.disableDebugMode();

    expect(data).toEqual([
      {
        actIndex: -1,
        code: "'first line'",
        line: 1,
        loc: 'test',
      },
      {
        actIndex: -1,
        code: 'A = 10',
        line: 2,
        loc: 'test',
      },
      {
        actIndex: -1,
        code: "'third line'",
        line: 3,
        loc: 'test',
      },
    ]);
  });

 
});
