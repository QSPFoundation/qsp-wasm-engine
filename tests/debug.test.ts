import { Mock, beforeEach, describe, vi, expect, it, afterEach } from 'vitest';
import { DebugRecord, QspAPI } from '../src';
import { prepareApi, runTestFile } from '../src/test-helpers';

describe('debug', () => {
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

  it('should read list of locations', () => {
    runTestFile(api, '');
    const locations = api.getLocationsList();
    expect(locations).toEqual(['start', 'test']);
  });

  it('should read location code', () => {
    runTestFile(
      api,
      `'first line'

act 'first act':
  'something'
end`,
    );

    const code = api.getLocationCode('test');

    expect(code).toEqual(["'first line'", '', "ACT 'first act':", "'something'", 'END']);
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
