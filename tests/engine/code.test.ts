import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, startTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('misc code', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('long line split', async () => {
    await runTestFile(
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

  test('long line split with tab before marker', async () => {
    await runTestFile(
      api,
      `
t = 1
if t	_
   or	_
   t:
  $type = 'new'
else
  $type = 'old'
end
    `,
    );

    expect(api.readVariable('$type')).toBe('new');
  });

  test('empty statements between separators are allowed', async () => {
    await runTestFile(api, `a = 1 && b = 2 & & c = 3`);

    expect(api.readVariable('a')).toBe(1);
    expect(api.readVariable('b')).toBe(2);
    expect(api.readVariable('c')).toBe(3);
  });

  test('statement argument gets converted to string', async () => {
    const onMsg: Mock = vi.fn();
    api.on('msg', onMsg);

    const { done } = await startTestFile(api, ` msg 567 ` );
    expect(onMsg).toHaveBeenCalledWith('567', expect.any(Function));
    onMsg.mock.calls[0][1]();
    await done;
  });

  test('statement argument gets converted to number', async () => {
    const onWait: Mock = vi.fn();
    api.on('wait', onWait);

    const { done } = await startTestFile(api, ` wait '567' `);
    expect(onWait).toHaveBeenCalledWith(567, expect.any(Function));
    onWait.mock.calls[0][1]();
    await done;
  });

  test('statement argument cant be converted to number', async () => {
    await runTestFile(api, ` wait 'sdsd' `);
    expect(error).toHaveBeenCalledWith({
      errorCode: 12,
      description: 'Type mismatch!',
      location: 'test',
      actionIndex: -1,
      line: 1,
      localLine: 1,
      lineSrc: "WAIT 'sdsd'"
    });
    error.mockReset();
  });

  test('function argument gets converted to string', async () => {
    await runTestFile(api, ` $x = replace(123456, 456, 34) `);
    expect(api.readVariable('$x')).toBe('12334');
  });

  test('function argument gets converted to number', async () => {
    await runTestFile(api, ` x = rgb('12', '234', 32) `);
    expect(api.readVariable('x')).toBe(-14620148);
  });

  test('function argument cant be converted to number', async () => {
    await runTestFile(api, ` x = rgb('123', '65sd', 56) `);
    expect(error).toHaveBeenCalledWith({
      errorCode: 12,
      description: 'Type mismatch!',
      location: 'test',
      actionIndex: -1,
      line: 1,
      localLine: 1,
      lineSrc: "X = RGB('123', '65sd', 56)"
    });
    error.mockReset();
  });
});
