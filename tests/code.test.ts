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

  test('statement argument gets converted to string', () => {
    const onMsg: Mock = vi.fn();
    api.on('msg', onMsg);

    runTestFile(api, ` msg 567 ` );
    expect(onMsg).toHaveBeenCalledWith('567', expect.any(Function));
    onMsg.mock.calls[0][1]();
  });

  test('statement argument gets converted to number', () => {
    const onWait: Mock = vi.fn();
    api.on('wait', onWait);

    runTestFile(api, ` wait '567' `);
    expect(onWait).toHaveBeenCalledWith(567, expect.any(Function));
    onWait.mock.calls[0][1]();
  });

  test('statement argument cant be converted to number', () => {
    runTestFile(api, ` wait 'sdsd' `);
    expect(error).toHaveBeenCalledWith({
      errorCode: 11,
      description: 'Type mismatch!',
      location: 'test',
      actionIndex: -1,
      line: 1,
      localLine: 1,
      lineSrc: "WAIT 'sdsd'"
    });
    error.mockReset();
  });

  test('function argument gets converted to string', () => {
    runTestFile(api, ` $x = replace(123456, 456, 34) `);
    expect(api.readVariable('$x')).toBe('12334');
  });

  test('function argument gets converted to number', () => {
    runTestFile(api, ` x = rgb('12', '234', 32) `);
    expect(api.readVariable('x')).toBe(-14620148);
  });

  test('function argument cant be converted to number', () => {
    runTestFile(api, ` x = rgb('123', '65sd', 789) `);
    expect(error).toHaveBeenCalledWith({
      errorCode: 11,
      description: 'Type mismatch!',
      location: 'test',
      actionIndex: -1,
      line: 1,
      localLine: 1,
      lineSrc: "X = RGB('123', '65sd', 789)"
    });
    error.mockReset();
  });
});
