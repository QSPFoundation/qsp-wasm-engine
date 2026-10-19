import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, startTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('menu', () => {
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
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('MENU should trigger showing menu', async () => {
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take stone:takestone'
$stone[1]='Throw stone:throwstone'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Take stone',
          image: '',
        },
        {
          name: 'Throw stone',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
    await done;
  });

  test('MENU should trigger showing menu without $ in name', async () => {
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take stone:takestone'
$stone[1]='Throw stone:throwstone'
menu 'stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Take stone',
          image: '',
        },
        {
          name: 'Throw stone',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
    await done;
  });

  test('MENU should trigger showing menu with icon', async () => {
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take stone:takestone:1.png'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Take stone',
          image: '1.png',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
    await done;
  });

  test('MENU stops on first empty item', async () => {
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take stone:takestone'
$stone[2]='Take stone:takestone'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Take stone',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
    await done;
  });

  test('MENU should support separator as -:-', async () => {
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take stone:takestone'
$stone[1]='-:-'
$stone[2]='Throw stone:throwstone'
menu '$stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Take stone',
          image: '',
        },
        {
          name: '-',
          image: '',
        },
        {
          name: 'Throw stone',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
    await done;
  });

  test('corresponding location should be called when menu item is selected', async () => {
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take stone:takestone'
$stone[1]='Throw stone:throwstone'
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
          name: 'Take stone',
          image: '',
        },
        {
          name: 'Throw stone',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](1);
    await done;

    expect(statsChanged).toHaveBeenCalledWith('thrown');
  });

  test('index(1 based) of selected item should be passed into processing loc', async () => {
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take stone:stone'
$stone[1]='Throw stone:stone'
menu '$stone'
---
# stone
r = args[0]
`,
    );

    menu.mock.calls[0][1](1);
    await done;

    expect(api.readVariable('r')).toBe(2);
  });

  test('name can contain : as searching for : starts from end', async () => {
    const { done } = await startTestFile(
      api,
      `
$stone[0]='Take: stone:takestone:'
menu 'stone'
`,
    );


    expect(menu).toHaveBeenCalledWith(
      [
        {
          name: 'Take: stone',
          image: '',
        },
      ],
      expect.any(Function),
    );
    menu.mock.calls[0][1](-1);
    await done;
  })
});
