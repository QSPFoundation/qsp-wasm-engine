import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';
import { QspPanel } from '../../src';

describe('actions', () => {
  let api: QspAPI;
  let error: Mock;
  let actsChanged: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    actsChanged = vi.fn();
    api.on('actions_changed', actsChanged);
  });

  afterEach(() => {
    api?._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('SHOWACTS should toggle acts visibility', () => {
    const panelVisibility = vi.fn();
    api.on('panel_visibility', panelVisibility);
    runTestFile(api, `SHOWACTS 0`);
    expect(panelVisibility).toHaveBeenCalledWith(QspPanel.ACTS, 0);

    runTestFile(api, `SHOWACTS 1`);
    expect(panelVisibility).toHaveBeenCalledWith(QspPanel.ACTS, 1);
  });

  test('single line ACT', () => {
    runTestFile(api, `act '1': p 1`);

    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
  });

  test('single line ACT with image', () => {
    runTestFile(api, `act '1', '1.png': p 1`);
    
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
end`,
    );

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
end`,
    );

    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '1.png',
      },
    ]);
  });

  test('ACTs with same name are ignored', () => {
    runTestFile(api, `act '1': p 1`);

    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
    ]);
    actsChanged.mockClear();
    api.execCode(`act '1': p 1`);
    expect(actsChanged).not.toHaveBeenCalled();
  });

  test('executing action', () => {
    const onStats = vi.fn();
    api.on('stats_changed', onStats);
    
    runTestFile(api, `act '1': p 'a'`);

    api.selectAction(0);
    api.execSelectedAction();
    expect(onStats).toHaveBeenCalledWith('a');
  })

  test('DELACT should delete action', () => {
    runTestFile(api, `act '1': p 1`);

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
    const statChanged = vi.fn();
    api.on('stats_changed', statChanged);
    runTestFile(
      api,
      `
act '1': p '1'
act '2':
  p '2'
  p '3'
end
p $CURACTS
`,
    );

    expect(statChanged).toHaveBeenCalledWith(`ACT '1': P '1'\r\nACT '2':\r\nP '2'\r\nP '3'\r\nEND\r\n`);
  });

  test('actions can be restored from CURACTS', () => {
    const statChanged = vi.fn();
    api.on('stats_changed', statChanged);
    runTestFile(
      api,
      `
      act '1': p 'a'
act '2':
  p 'b'
  p 'c'
end
$acts = $CURACTS`
    );

    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
      {
        name: '2',
        image: '',
      },
    ]);

    actsChanged.mockReset();

    api.execCode(`CLA`);
    expect(actsChanged).toHaveBeenCalledWith([]);
    actsChanged.mockReset();

    api.execCode(`dynamic $acts`);
    expect(actsChanged).toHaveBeenCalledWith([
      {
        name: '1',
        image: '',
      },
      {
        name: '2',
        image: '',
      },
    ]);
  })

  test('$SELACT should return currently selected action', () => {
    runTestFile(api, `act '1': p 1`);
    api.selectAction(0);
    api.execCode('$selected = $SELACT');
    expect(api.readVariable('$selected')).toBe('1');
  });

  test('CLA should clear list of actions', () => {
    runTestFile(api, `act '1': p 1`);

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

  test('multi line act supports comments', () => {
    runTestFile(
      api,
      `
x = 1
act 'test': ! test comment
  x = 2
end
    `,
    );

    expect(api.readVariable('x')).toBe(1);
    api.selectAction(0);
    api.execSelectedAction();
    expect(api.readVariable('x')).toBe(2);
  });

  test('multiline act requires colon', () => {
    runTestFile(
      api,
      `
        act 'test'
        end
        `,
    );
    expect(error).toHaveBeenCalledWith({
      actionIndex: -1,
      description: 'Sign [:] not found!',
      errorCode: 16,
      line: 2,
      lineSrc: 'ACT \'test\'',
      localLine: 2,
      location: 'test',
    });
    error.mockReset();
  });
});
