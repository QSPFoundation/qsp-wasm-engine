import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('objects', () => {
  let api: QspAPI;
  let error: Mock;
  let menu: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
    menu = jest.fn();
    api.on('menu', menu);
  });

  test('MENU should trigger showing menu', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[1]='Кинуть камень:throwstone'
menu '$stone'
`
    );

    expect(error).not.toHaveBeenCalled();
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
      expect.any(Function)
    );
  });

  test('MENU should trigger showing menu without $ in name', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[1]='Кинуть камень:throwstone'
menu 'stone'
`
    );

    expect(error).not.toHaveBeenCalled();
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
      expect.any(Function)
    );
  });

  test('MENU should trigger showing menu with icon', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone:1.png'
menu '$stone'
`
    );

    expect(error).not.toHaveBeenCalled();
    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '1.png',
        },
      ],
      expect.any(Function)
    );
  });

  test('MENU stops on first empty item', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[2]='Взять камень:takestone'
menu '$stone'
`
    );

    expect(error).not.toHaveBeenCalled();
    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Взять камень',
          image: '',
        },
      ],
      expect.any(Function)
    );
  });

  test('MENU should support separator as -:-', () => {
    runTestFile(
      api,
      `
$stone[0]='Взять камень:takestone'
$stone[1]='-:-'
$stone[2]='Кинуть камень:throwstone'
menu '$stone'
`
    );

    expect(error).not.toHaveBeenCalled();
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
      expect.any(Function)
    );
  });

  test('corresponding location should be called when menu item is selected', () => {
    const statsChanged = jest.fn();
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
`
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
      expect.any(Function)
    );
    // eslint-disable-next-line @typescript-eslint/ban-types
    (menu.mock.calls[0][1] as Function)(1);
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledWith('thrown');
  });
});
