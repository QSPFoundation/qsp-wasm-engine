import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

// TODO После обработки локации предыдущие значения ARGS и RESULT восстанавливаются.

describe('api', () => {
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
    api._run_checks();
  });

  test('GOTO', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
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
    `,
    );

    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GOTO 'target', 1, 'test'`);

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
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
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
    `,
    );

    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GT 'target', 1, 'test'`);

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
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
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
    `,
    );
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`XGOTO 'target', 1, 'test'`);

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
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
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
    `,
    );

    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`XGT 'target', 1, 'test'`);

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
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
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
    `,
    );

    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GOSUB 'target', 1, 'test'`);

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
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
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
    `,
    );

    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`GS 'target', 1, 'test'`);

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
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
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
    `,
    );
    expect(onMain).toHaveBeenCalledWith('main');
    expect(onStats).toHaveBeenCalledWith('stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '1',
      },
    ]);

    api.execCode(`func('target', 1, 'test')`);

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
    `,
    );
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
    `,
    );
    expect(api.readVariable('$x')).toBe('test');
  });

  test('EXIT', () => {
    runTestFile(
      api,
      `
x = 1
exit
x = 2
    `,
    );

    expect(api.readVariable('x')).toBe(1);
  });

  test('GOTO arguments in actions', () => {
    runTestFile(
      api,
      `
gt 'target', 'test', 12
---
# target
act '2':
  $args_0 = $args[0]
  args_1 = args[1]
end
    `,
    );
    api.selectAction(0);
    api.execSelectedAction();
    expect(api.readVariable('$args_0')).toBe('test');
    expect(api.readVariable('args_1')).toBe(12);
  });

  test('XGOTO arguments in actions', () => {
    runTestFile(
      api,
      `
xgt 'target', 'test', 12
---
# target
act '2':
  $args_0 = $args[0]
  args_1 = args[1]
end
    `,
    );

    api.selectAction(0);
    api.execSelectedAction();
  
    expect(api.readVariable('$args_0')).toBe('test');
    expect(api.readVariable('args_1')).toBe(12);
  });

  test('user func shorthand', () => {
    runTestFile(
      api,
      `
@target(1, 'test')
---
# target
first = args[0]
$second = $args[1]
    `,
    );

    expect(api.readVariable('first')).toBe(1);
    expect(api.readVariable('$second')).toBe('test');
  });

  test('user func shorthand RESULT', () => {
    runTestFile(
      api,
      `
x = @process
---
# process
result = 5
    `,
    );
    expect(api.readVariable('x')).toBe(5);
  });
});
