import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, runTestFileWithGoto } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('locations', () => {
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

  test('GOTO should change locations', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
    api.on('actions_changed', onActs);
    runTestFileWithGoto(
      api,
      `
*p 'main'
p 'stats'
$location = $curloc
act '1': x
---
# target
*p 'target main'
nl 'target stats'
act '2': x
$gt_location = $curloc
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
    expect(api.readVariable('$location')).toBe('test');

    api.execCode(`GOTO 'target', 1, 'test'`);

    expect(onMain).toHaveBeenCalledWith('target main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariableByIndex('args', 0)).toBe(1);
    expect(api.readVariableByIndex('$args', 1)).toBe('test');
    expect(api.readVariable('$gt_location')).toBe('target');
  });

  test('GT should change locations', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
    api.on('actions_changed', onActs);
    runTestFileWithGoto(
      api,
      `
*p 'main'
p 'stats'
act '1': x
$location = $curloc
---
# target
*p 'target main'
nl 'target stats'
act '2': x
$gt_location = $curloc
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
    expect(api.readVariable('$location')).toBe('test');

    api.execCode(`GT 'target', 1, 'test'`);

    expect(onMain).toHaveBeenCalledWith('target main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariableByIndex('args', 0)).toBe(1);
    expect(api.readVariableByIndex('$args', 1)).toBe('test');
    expect(api.readVariable('$gt_location')).toBe('target');
  });

  test('XGOTO', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
    api.on('actions_changed', onActs);
    runTestFileWithGoto(
      api,
      `
*p 'main'
p 'stats'
act '1': x
$location = $curloc
---
# target
*nl 'target main'
nl 'target stats'
act '2': x
$xgt_location = $curloc
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
    expect(api.readVariable('$location')).toBe('test');

    api.execCode(`XGOTO 'target', 1, 'test'`);

    expect(onMain).toHaveBeenCalledWith('main\r\ntarget main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariableByIndex('args', 0)).toBe(1);
    expect(api.readVariableByIndex('$args', 1)).toBe('test');
    expect(api.readVariable('$xgt_location')).toBe('target');
  });

  test('XGT', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
    api.on('actions_changed', onActs);
    runTestFileWithGoto(
      api,
      `
*p 'main'
p 'stats'
act '1': x
$location = $curloc
---
# target
*nl 'target main'
nl 'target stats'
act '2': x
$xgt_location = $curloc
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
    expect(api.readVariable('$location')).toBe('test');

    api.execCode(`XGT 'target', 1, 'test'`);

    expect(onMain).toHaveBeenCalledWith('main\r\ntarget main');
    expect(onStats).toHaveBeenCalledWith('stats\r\ntarget stats');
    expect(onActs).toHaveBeenCalledWith([
      {
        image: '',
        name: '2',
      },
    ]);

    expect(api.readVariableByIndex('args', 0)).toBe(1);
    expect(api.readVariableByIndex('$args', 1)).toBe('test');
    expect(api.readVariable('$xgt_location')).toBe('target');
  });

  test('GOSUB should execute location without changing it', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
    api.on('actions_changed', onActs);
    
    runTestFileWithGoto(
      api,
      `
*p 'main'
p 'stats'
$location = $curloc
act '1': x
---
# target
*nl 'target main'
nl 'target stats'
$gs_location = $curloc
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
    expect(api.readVariable('$location')).toBe('test');

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
    expect(api.readVariable('$gs_location')).toBe('test');
  });

  test('GS should execute location without changing it', () => {
    const onMain = vi.fn();
    api.on('main_changed', onMain);
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    const onActs = vi.fn();
    api.on('actions_changed', onActs);
    runTestFileWithGoto(
      api,
      `
*p 'main'
p 'stats'
$location = $curloc
act '1': x
---
# target
*nl 'target main'
nl 'target stats'
$gs_location = $curloc
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
    expect(api.readVariable('$location')).toBe('test');

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
    expect(api.readVariable('$gs_location')).toBe('test');
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

  test('FUNC with RESULT', () => {
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

  test('FUNC with $RESULT', () => {
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

  test('EXIT should stop code execution', () => {
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

  test('GOTO arguments should be avaliable in actions', () => {
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

  test('restoring args and result', () => {
    runTestFile(
      api,
      `
gs 'first', 'fir', 1
---
# first
$first_0_before = $args[0]
first_1_before = args[1]
result = 1

gs 'second', 'sec', 2

$first_0_after = $args[0]
first_1_after = args[1]
first_result = result
---
#second
$second_0 = $args[0]
second_1 = args[1]
result = 2
      `
    ); 

    expect(api.readVariable('$first_0_before')).toBe('fir');
    expect(api.readVariable('first_1_before')).toBe(1);
    expect(api.readVariable('$first_0_after')).toBe('fir');
    expect(api.readVariable('first_1_after')).toBe(1);
    expect(api.readVariable('first_result')).toBe(1);
    expect(api.readVariable('$second_0')).toBe('sec');
    expect(api.readVariable('second_1')).toBe(2);
  })
});
