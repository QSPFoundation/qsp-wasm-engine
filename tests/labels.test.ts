import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('labels', () => {
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

  test('JUMP should go to label', () => {
    runTestFile(
      api,
      `
x = 1
jump 'end'
x = 2
:end
    `,
    );

    expect(api.readVariable('x')).toBe(1);
  });

  test('labels are case insensitive', () => {
    runTestFile(
      api,
      `
x = 1
jump 'END'
x = 2
:end
    `,
    );

    expect(api.readVariable('x')).toBe(1);
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

  test('JUMP works inside action code', () => {
    runTestFile(
      api,
      `
      act 'test':
        x = 1
        jump 'END'
        x = 2
        :end
      end`,
    );
    expect(api.readVariable('x')).toBe(0);

    api.selectAction(0);
    api.execSelectedAction();

    expect(api.readVariable('x')).toBe(1);
  });

  test('JUMP works inside DYNAMIC', () => {
    runTestFile(
      api,
      `
      x = 3
      DYNAMIC "
        x = 1
        jump 'END'
        x = 2
        :end
      "`,
    );
    expect(api.readVariable('x')).toBe(1);
  });

  test('JUMP works inside DYNEVAL', () => {
    runTestFile(
      api,
      `
      x = 3
      DYNEVAL("
        x = 1
        jump 'END'
        x = 2
        :end
      ")`,
    );
    expect(api.readVariable('x')).toBe(1);
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
    error.mockClear();
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
    error.mockClear();
  });

  test('error jump from dynaeval', () => {
    runTestFile(
      api,
      `
DYNEVAL(" x = 1 & jump 'end' ")
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
    error.mockClear();
  });
});
