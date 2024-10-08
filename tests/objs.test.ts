import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';
import { QspPanel } from '../src';

describe('objects', () => {
  let api: QspAPI;
  let error: Mock;
  let objectsChanged: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    objectsChanged = vi.fn();
    api.on('objects_changed', objectsChanged);
  });
  afterEach(() => {
    api._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('SHOWOBJS should toggle objs visibility', () => {
    const panelVisibility = vi.fn();
    api.on('panel_visibility', panelVisibility);
    runTestFile(api, `SHOWOBJS 0`);
    expect(panelVisibility).toHaveBeenCalledWith(QspPanel.OBJS, 0);

    api.execCode(`SHOWOBJS 1`);
    expect(panelVisibility).toHaveBeenCalledWith(QspPanel.OBJS, 1);
  });

  test('ADDOBJ should add object to end of list', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'second',
        image: '',
      },
    ]);
  });

  test('ADDOBJ should add objects with same name', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'first'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'first',
        image: '',
      },
    ]);
  });

  test('ADDOBJ should add object with image', () => {
    runTestFile(api, `ADDOBJ 'first', '1.png'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
    ]);
  });

  test('ADDOBJ should add object into specified position (1 based)', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second', '', 1`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'second',
        image: '',
      },
      {
        name: 'first',
        image: '',
      },
    ]);
  });

  test('ADD OBJ should add object to end of list', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'second',
        image: '',
      },
    ]);
  });

  test('ADD OBJ should add object with image', () => {
    runTestFile(api, `ADD OBJ 'first', '1.png'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
    ]);
  });

  test('ADD OBJ should add object into specified position', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second', '', 1`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'second',
        image: '',
      },
      {
        name: 'first',
        image: '',
      },
    ]);
  });

  test('$CUROBJS should return list of objects', () => {
    const statChanged = vi.fn();
    api.on('stats_changed', statChanged);
    runTestFile(api, `ADDOBJ 'first','1.png' & ADDOBJ 'second' & p $CUROBJS`);

    expect(statChanged).toHaveBeenCalledWith(`ADDOBJ 'first','1.png'\r\nADDOBJ 'second'\r\n`);
  });

  test('objects should be restored from $CUROBJS', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second','2.png' & $objs = $CUROBJS`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'second',
        image: '2.png',
      },
    ]);
    objectsChanged.mockReset();

    api.execCode('KILLOBJ');
    expect(objectsChanged).toHaveBeenCalledWith([]);

    api.execCode('dynamic $objs');

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'second',
        image: '2.png',
      },
    ]);
  });

  test('DELOBJ should delete object by name', () => {
    runTestFile(api, `ADDOBJ 'first', '1.png'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
    ]);
    objectsChanged.mockClear();
    api.execCode(`DELOBJ 'first'`);

    expect(objectsChanged).toHaveBeenCalledWith([]);
  });

  test('DEL OBJ should delete object by name', () => {
    runTestFile(api, `ADDOBJ 'first', '1.png'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
    ]);
    objectsChanged.mockClear();
    api.execCode(`DEL OBJ 'first'`);
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([]);
  });

  test('DELOBJ deletes first object in list if there are several objects with the same name', () => {
    runTestFile(api, `ADDOBJ 'first', '1.png' & ADDOBJ 'first', '2.png'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
      {
        name: 'first',
        image: '2.png',
      },
    ]);
    objectsChanged.mockClear();
    api.execCode(`DELOBJ 'first'`);
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '2.png',
      },
    ]);
  });

  test('KILLOBJ should delete object by index', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'second',
        image: '',
      },
    ]);
    objectsChanged.mockClear();
    api.execCode(`KILLOBJ 1`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'second',
        image: '',
      },
    ]);
  });

  test('KILLOBJ should clear inventory when called without index', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'second',
        image: '',
      },
    ]);
    objectsChanged.mockClear();
    api.execCode(`KILLOBJ`);

    expect(objectsChanged).toHaveBeenCalledWith([]);
  });

  test('KILLALL should clear inventory', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second'`);

    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '',
      },
      {
        name: 'second',
        image: '',
      },
    ]);
    objectsChanged.mockClear();
    api.execCode(`KILLALL`);

    expect(objectsChanged).toHaveBeenCalledWith([]);
  });

  test('$SELOBJ should return name of selected object', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second'`);

    api.selectObject(1);
    api.execCode('$selected = $SELOBJ');

    expect(api.readVariable('$selected')).toBe('second');
  });

  test('COUNTOBJ should return number of objects', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second' & count = COUNTOBJ`);

    expect(api.readVariable('count')).toBe(2);
  });

  test('$GETOBJ should return object name at position', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second' & $first = $GETOBJ(1)`);

    expect(api.readVariable('$first')).toBe('first');
  });

  test('reading last object in list', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second' & $last = $GETOBJ(COUNTOBJ)`);

    expect(api.readVariable('$last')).toBe('second');
  });

  test('$GETOBJ should return empty string if no object at position', () => {
    runTestFile(api, `$first = $GETOBJ(1)`);

    expect(api.readVariable('$first')).toBe('');
  });

  test('UNSELECT should unselect object', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second'`);

    api.selectObject(1);
    api.execCode('$obj = $SELOBJ');
    expect(api.readVariable('$obj')).toBe('second');
    api.execCode('UNSELECT & $obj = $SELOBJ');
    expect(api.readVariable('$obj')).toBe('');
  });

  test('UNSEL should unselect object', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second'`);

    api.selectObject(1);
    api.execCode('$obj = $SELOBJ');
    expect(api.readVariable('$obj')).toBe('second');
    api.execCode('UNSEL & $obj = $SELOBJ');
    expect(api.readVariable('$obj')).toBe('');
  });
});
