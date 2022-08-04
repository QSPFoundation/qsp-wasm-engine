import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

// TODO После обработки локации предыдущие значения ARGS и RESULT восстанавливаются.

describe('api', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('GOTO', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);
    const onStats = jest.fn();
    api.on('stats_changed', onStats);
    const onActs = jest.fn();
    api.on('actions_changed', onActs);
    runTestFile(
      api,
      `
*p 'main'
p 'stats'
act '1': x
---
# target
*p 'target main'
nl 'target stats'
act '2': x
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GOTO 'target', 1, 'test'`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('target main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariable('args', 0)).toBe(1);
    expect(api.readVariable('$args', 1)).toBe('test');
  });

  test('GT', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);
    const onStats = jest.fn();
    api.on('stats_changed', onStats);
    const onActs = jest.fn();
    api.on('actions_changed', onActs);
    runTestFile(
      api,
      `
*p 'main'
p 'stats'
act '1': x
---
# target
*p 'target main'
nl 'target stats'
act '2': x
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GT 'target', 1, 'test'`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('target main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariable('args', 0)).toBe(1);
    expect(api.readVariable('$args', 1)).toBe('test');
  });

  test('XGOTO', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);
    const onStats = jest.fn();
    api.on('stats_changed', onStats);
    const onActs = jest.fn();
    api.on('actions_changed', onActs);
    runTestFile(
      api,
      `
*p 'main'
p 'stats'
act '1': x
---
# target
*nl 'target main'
nl 'target stats'
act '2': x
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`XGOTO 'target', 1, 'test'`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main\r\ntarget main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariable('args', 0)).toBe(1);
    expect(api.readVariable('$args', 1)).toBe('test');
  });

  test('XGT', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);
    const onStats = jest.fn();
    api.on('stats_changed', onStats);
    const onActs = jest.fn();
    api.on('actions_changed', onActs);
    runTestFile(
      api,
      `
*p 'main'
p 'stats'
act '1': x
---
# target
*nl 'target main'
nl 'target stats'
act '2': x
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`XGT 'target', 1, 'test'`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main\r\ntarget main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariable('args', 0)).toBe(1);
    expect(api.readVariable('$args', 1)).toBe('test');
  });

  test('GOSUB', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);
    const onStats = jest.fn();
    api.on('stats_changed', onStats);
    const onActs = jest.fn();
    api.on('actions_changed', onActs);
    runTestFile(
      api,
      `
*p 'main'
p 'stats'
act '1': x
---
# target
*nl 'target main'
nl 'target stats'
act '2': x
first = args[0]
$second = $args[1]
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GOSUB 'target', 1, 'test'`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main\r\ntarget main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariable('first')).toBe(1);
    expect(api.readVariable('$second')).toBe('test');
  });

  test('GS', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);
    const onStats = jest.fn();
    api.on('stats_changed', onStats);
    const onActs = jest.fn();
    api.on('actions_changed', onActs);
    runTestFile(
      api,
      `
*p 'main'
p 'stats'
act '1': x
---
# target
*nl 'target main'
nl 'target stats'
act '2': x
first = args[0]
$second = $args[1]
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GS 'target', 1, 'test'`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main\r\ntarget main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariable('first')).toBe(1);
    expect(api.readVariable('$second')).toBe('test');
  });

  test('FUNC', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);
    const onStats = jest.fn();
    api.on('stats_changed', onStats);
    const onActs = jest.fn();
    api.on('actions_changed', onActs);
    runTestFile(
      api,
      `
*p 'main'
p 'stats'
act '1': x
---
# target
*nl 'target main'
nl 'target stats'
act '2': x
first = args[0]
$second = $args[1]
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`func('target', 1, 'test')`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledWith('main\r\ntarget main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariable('first')).toBe(1);
    expect(api.readVariable('$second')).toBe('test');
  });

  test('FUNC RESULT', () => {
    runTestFile(
      api,
      `
x = func('process')
---
# process
result = 5
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(5);
  });

  test('FUNC $RESULT', () => {
    runTestFile(
      api,
      `
$x = func('process')
---
# process
$result = 'test'
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$x')).toBe('test');
  });

  test('EXIT', () => {
    runTestFile(
      api,
      `
x = 1
exit
x = 2
    `
    );

    expect(api.readVariable('x')).toBe(1);
  });
});