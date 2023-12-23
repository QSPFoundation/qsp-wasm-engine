import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('conditionals', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('JUMP', () => {
    runTestFile(
      api,
      `
x = 1 & y = 1
jump 'end'
x = 2
:end
if x = 1: y = 2
    `,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(2);
  });

  test('jump loops', () => {
    const onStat = jest.fn();
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

    expect(error).not.toHaveBeenCalled();
    expect(onStat).toHaveBeenCalledWith('123456789');
  });

  test('error jump from action', () => {
    runTestFile(
      api,
      `
act '1': x = 1 & jump 'end'
:end
  `,
    );
    expect(error).not.toHaveBeenCalled();
    api.selectAction(0);
    api.execSelectedAction();
    expect(api.readVariable('x')).toBe(1);
    expect(error).toHaveBeenCalledWith({
      actionIndex: -1,
      code: 112,
      description: 'Label not found!',
      line: 2,
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
      code: 112,
      description: 'Label not found!',
      line: 2,
      location: 'test',
    });
  });
});
