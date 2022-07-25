import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';
import { QspPanel } from '../src';

describe('acts', () => {
  let api: QspAPI;
  let error: Mock;
  let actsChanged: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
    actsChanged = jest.fn();
    api.on('actions_changed', actsChanged);
  });

  test('SHOWACTS should toggle acts visibility', () => {
    const panelVisibility = jest.fn();
    api.on('panel_visibility', panelVisibility);
    runTestFile(api, `SHOWACTS 0`);
    expect(panelVisibility).toBeCalledWith(QspPanel.ACTS, 0);
  });

  test('single line ACT', () => {
    runTestFile(api, `act '1': p 1`);
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
  });

  test('single line ACT with image', () => {
    runTestFile(api, `act '1', '1.png': p 1`);
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '1.png',
      },
    ]);
  });

  test('multi line ACT', () => {
    runTestFile(
      api,
      `act '1':
  p 1
end`
    );
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
  });

  test('multi line ACT with image', () => {
    runTestFile(
      api,
      `act '1', '1.png':
  p 1
end`
    );
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '1.png',
      },
    ]);
  });

  test('DELACT should delete action', () => {
    runTestFile(api, `act '1': p 1`);
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
    actsChanged.mockClear();
    api.execCode(`DELACT '1'`);
    expect(actsChanged).toHaveBeenCalledWith([]);
  });

  test('DEL ACT should delete action', () => {
    runTestFile(api, `act '1': p 1`);
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
    actsChanged.mockClear();
    api.execCode(`DEL ACT '1'`);
    expect(actsChanged).toHaveBeenCalledWith([]);
  });

  test('$CURACTS should return acts list as code', () => {
    runTestFile(
      api,
      `
act '1': p 1
act '2':
  p 2
  p 3
end
$acts = $CURACTS
`
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableString('$acts')).toEqual(
      `ACT '1': P 1\r\nACT '2':\r\nP 2\r\nP 3\r\nEND\r\n`
    );
  });

  test('$SELACT should return currently selected action', () => {
    runTestFile(api, `act '1': p 1`);
    api.selectAction(0);
    api.execCode('$selected = $SELACT');
    expect(api.readVariableString('$selected')).toBe('1');
  });

  test('CLA should clear list of actions', () => {
    runTestFile(api, `act '1': p 1`);
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
    actsChanged.mockClear();
    api.execCode(`CLA`);
    expect(actsChanged).toHaveBeenCalledWith([]);
  });

  test('CLS should clear list of actions', () => {
    runTestFile(api, `act '1': p 1`);
    expect(error).not.toHaveBeenCalled();
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
    actsChanged.mockClear();
    api.execCode(`CLS`);
    expect(actsChanged).toHaveBeenCalledWith([]);
  });
});
