import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('objects', () => {
  let api: QspAPI;
  let error: Mock;
  let menu: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
    menu = vi.fn();
    api.on('menu', menu);
  });
  afterEach(() => {
    api._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('MENU should trigger showing menu', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[1]='Кинуть камень:throwstone'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '',
        },
        {
          name: 'Кинуть камень',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
  });

  test('MENU should trigger showing menu without $ in name', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[1]='Кинуть камень:throwstone'
menu 'stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '',
        },
        {
          name: 'Кинуть камень',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
  });

  test('MENU should trigger showing menu with icon', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone:1.png'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '1.png',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
  });

  test('MENU stops on first empty item', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[2]='Взять камень:takestone'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
  });

  test('MENU should support separator as -:-', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[1]='-:-'
$stone[2]='Кинуть камень:throwstone'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '',
        },
        {
          name: '-',
          image: '',
        },
        {
          name: 'Кинуть камень',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
  });

  test('corresponding location should be called when menu item is selected', () => {
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[1]='Кинуть камень:throwstone'
menu '$stone'
---
# takestone
p 'taken'
---
# throwstone
p 'thrown'
`,
    );

    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '',
        },
        {
          name: 'Кинуть камень',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](1);

    expect(statsChanged).toHaveBeenCalledWith('thrown');
  });

  test('index(1 based) of selected item should be passed into processing loc', () => {
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(
      api,
      `
$stone[0]='Взять камень:stone'
$stone[1]='Кинуть камень:stone'
menu '$stone'
---
# stone
r = args[0]
`,
    );

    menu.mock.calls[0][1](1);

    expect(api.readVariable('r')).toBe(2);
  });
});
