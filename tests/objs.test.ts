import { Mock, beforeEach, describe, vi, test, expect } from 'vitest';
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

  test('SHOWOBJS should toggle acts visibility', () => {
    const panelVisibility = vi.fn();
    api.on('panel_visibility', panelVisibility);
    runTestFile(api, `SHOWOBJS 0`);
    expect(panelVisibility).toHaveBeenCalledWith(QspPanel.OBJS, 0);
  });

  test('ADDOBJ should add object to end of list', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second'`);
    expect(error).not.toHaveBeenCalled();
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

  test('ADDOBJ should add object with image', () => {
    runTestFile(api, `ADDOBJ 'first', '1.png'`);
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
    ]);
  });

  test('ADDOBJ should add object into specified position', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second', '', 1`);
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
    ]);
  });

  test('ADD OBJ should add object into specified position', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second', '', 1`);
    expect(error).not.toHaveBeenCalled();
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

  test('DELOBJ should delete object by name', () => {
    runTestFile(api, `ADDOBJ 'first', '1.png'`);
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'first',
        image: '1.png',
      },
    ]);
    objectsChanged.mockClear();
    api.execCode(`DELOBJ 'first'`);
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([]);
  });

  test('DEL OBJ should delete object by name', () => {
    runTestFile(api, `ADDOBJ 'first', '1.png'`);
    expect(error).not.toHaveBeenCalled();
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

  test('KILLOBJ should delete object by index', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second'`);
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([
      {
        name: 'second',
        image: '',
      },
    ]);
  });

  test('KILLOBJ should clear inventory when called without index', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second'`);
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([]);
  });

  test('KILLALL should clear inventory', () => {
    runTestFile(api, `ADD OBJ 'first' & ADD OBJ 'second'`);
    expect(error).not.toHaveBeenCalled();
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
    expect(error).not.toHaveBeenCalled();
    expect(objectsChanged).toHaveBeenCalledWith([]);
  });

  test('$SELOBJ should return name of selected object', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second'`);
    expect(error).not.toHaveBeenCalled();
    api.selectObject(1);
    api.execCode('$selected = $SELOBJ');
    expect(api.readVariable('$selected')).toBe('second');
  });

  test('COUNTOBJ should return number of object', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second' & count = COUNTOBJ`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('count')).toBe(2);
  });

  test('$GETOBJ should return object name in position', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second' & $first = $GETOBJ(1)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$first')).toBe('first');
  });

  test('reading last object in list', () => {
    runTestFile(api, `ADDOBJ 'first' & ADDOBJ 'second' & $last = $GETOBJ(COUNTOBJ)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$last')).toBe('second');
  });

  test('$GETOBJ should return empty string if no object position', () => {
    runTestFile(api, `$first = $GETOBJ(1)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$first')).toBe('');
  });
});
