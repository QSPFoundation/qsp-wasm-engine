import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, loadTestLocations } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';
import { QspLocation } from '@qsp/converters';

describe('location data retrieval API', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?.dispose();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  it('getLocationsList should return all location names', async () => {
    await runTestFile(
      api,
      `
*p 'main location'
---
# second
*p 'second location'
---
# third
*p 'third location'
    `,
    );

    const locations = api.getLocationsList();
    expect(locations).toEqual(expect.arrayContaining(['start', 'test', 'second', 'third']));
    expect(locations.length).toBe(4);
  });

  it('lists bigger than the reusable buffer are read completely', async () => {
    const lines = Array.from({ length: 400 }, (_, i) => `X = ${i}`); // the engine upper-cases code
    const locations: QspLocation[] = Array.from({ length: 700 }, (_, i) => ({
      name: `loc${i}`,
      code: [],
      description: [],
      actions: [],
    }));
    locations.push({
      name: 'big',
      code: lines,
      description: [],
      actions: [{ name: 'act', image: 'act.png', code: lines }],
    });
    await loadTestLocations(api, locations);

    const names = api.getLocationsList();
    expect(names.length).toBe(701);
    expect(names[0]).toBe('loc0');
    expect(names[699]).toBe('loc699');
    expect(names[700]).toBe('big');
    const numbered = lines.map((code, i) => ({ line: i + 1, code }));
    expect(api.getLocationCode('big')).toEqual(numbered);
    expect(api.getLocationActionCode('big', 0)).toEqual(numbered);
    expect(api.getLocationActions('big')).toEqual([{ name: 'act', image: 'act.png' }]);
    expect(api.getLocationCode('loc5')).toEqual([]);
  });

  it('objects bigger than the reusable buffer are read completely', async () => {
    const objects = vi.fn();
    api.on('objects_changed', objects);
    await runTestFile(
      api,
      `loop i = 0 while i < 200 step i += 1: addobj 'object' + $str(i), 'img' + $str(i) + '.png'`,
    );

    const list = objects.mock.lastCall?.[0];
    expect(list.length).toBe(200);
    expect(list[199]).toEqual({ name: 'object199', image: 'img199.png', title: 'object199' });
  });

  it('getLocationCode should return location source code', async () => {
    await runTestFile(
      api,
      `
*p 'main location'
x = 1
$name = 'test'
---
# second
*p 'second location'
y = 2
    `,
    );

    const testLocationCode = api.getLocationCode('test');
    expect(testLocationCode).toEqual(
      expect.arrayContaining([
        { line: 2, code: "*P 'main location'" },
        { line: 3, code: 'X = 1' },
        { line: 4, code: "$NAME = 'test'" },
      ]),
    );

    const secondLocationCode = api.getLocationCode('second');
    expect(secondLocationCode).toEqual(
      expect.arrayContaining([
        { line: 1, code: "*P 'second location'" },
        { line: 2, code: 'Y = 2' },
      ]),
    );
  });

  it('getLocationActions should return base actions for a location', async () => {
    await loadTestLocations(api, [
      {
        name: 'test',
        code: [],
        description: [],
        actions: [
          {
            name: 'test',
            image: 'test.png',
            code: ['x = 1', "$name = 'test'"],
          },
          {
            name: 'test2',
            image: 'test.png',
            code: ['x = 2', "$name = 'test'"],
          },
        ],
      },
    ]);

    const actions = api.getLocationActions('test');
    expect(actions).toEqual([
      {
        name: 'test',
        image: 'test.png',
      },
      {
        name: 'test2',
        image: 'test.png',
      },
    ]);

    // Test with non-existent location
    const nonExistentActions = api.getLocationActions('nonexistent');
    expect(nonExistentActions).toEqual([]);
  });

  it('getLocationActionCode should work with location base actions', async () => {
    await loadTestLocations(api, [
      {
        name: 'test',
        code: [],
        description: [],
        actions: [
          {
            name: 'test',
            image: 'test.png',
            code: ['x = 1', "$name = 'test'"],
          },
          {
            name: 'test2',
            image: 'test.png',
            code: ['x = 2', "$name = 'test'"],
          },
        ],
      },
    ]);

    const code = api.getLocationActionCode('test', 0);
    expect(code).toEqual([
      { line: 1, code: 'X = 1' },
      { line: 2, code: "$NAME = 'test'" },
    ]);

    const code2 = api.getLocationActionCode('test', 1);
    expect(code2).toEqual([
      { line: 1, code: 'X = 2' },
      { line: 2, code: "$NAME = 'test'" },
    ]);
  });

  it('getLocationCode should return empty array for non-existent location', async () => {
    await runTestFile(api, `*p 'test'`);

    const code = api.getLocationCode('nonexistent');
    expect(code).toEqual([]);
  });

  it('getLocationActionCode should return empty array for non-existent action', async () => {
    await runTestFile(api, ``);

    const code = api.getLocationActionCode('test', 5);
    expect(code).toEqual([]);
  });

  it('should read list of locations (debug)', async () => {
    await runTestFile(api, '');
    const locations = api.getLocationsList();
    expect(locations).toEqual(['start', 'test']);
  });

  it('should read location code (debug)', async () => {
    await runTestFile(
      api,
      `'first line'

act 'first act':
  'something'
end`,
    );

    const code = api.getLocationCode('test');

    expect(code).toEqual([
      { line: 1, code: "'first line'" },
      { line: 2, code: '' },
      { line: 3, code: "ACT 'first act':" },
      { line: 4, code: "'something'" },
      { line: 5, code: 'END' },
    ]);
  });

  it("returns code lines with the engine's line numbers", async () => {
    await runTestFile(api, ['x = 1 + _', '  2', 'z = 3', 'y = 1 / 0'].join('\n'));
    // a line ending in ' _' is joined with the next one, the entry keeps the first line's number
    expect(api.getLocationCode('test')).toEqual([
      { line: 1, code: 'X = 1 + 2' },
      { line: 3, code: 'Z = 3' },
      { line: 4, code: 'Y = 1 / 0' },
    ]);
    // the same numbers as the errors
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ location: 'test', line: 4 }));
    error.mockClear();

    await runTestFile(api, ["$s = 'a", "b'", 'z = 3'].join('\n'));
    expect(api.getLocationCode('test')).toEqual([
      { line: 1, code: "$S = 'a\r\nb'" },
      { line: 3, code: 'Z = 3' },
    ]);
  });

  it('returns the code of a current action', async () => {
    await runTestFile(api, ['x = 0', "act 'A': x = 1", "act 'B':", '  x = 2', 'end'].join('\n'));
    // numbered as the lines of the location that added the action; the text after the colon
    expect(api.getActionCode(0)).toEqual([{ line: 2, code: ' X = 1' }]);
    expect(api.getActionCode(1)).toEqual([{ line: 4, code: 'X = 2' }]);
    expect(api.getActionCode(2)).toEqual([]);
    expect(api.getActionCode(-1)).toEqual([]);
  });

  describe('getLocationDescription', () => {
    it('should return description for location with static description', async () => {
      await loadTestLocations(api, [
        {
          name: 'testloc',
          code: [],
          description: ['This is a test location', 'with multiple lines'],
          actions: [],
        },
      ]);

      const desc = api.getLocationDescription('testloc');
      expect(typeof desc).toBe('string');
      expect(desc).toContain('test location');
    });

    it('should return description for location with single line description', async () => {
      await loadTestLocations(api, [
        {
          name: 'simpleloc',
          code: [],
          description: ['Simple location description'],
          actions: [],
        },
      ]);

      const desc = api.getLocationDescription('simpleloc');
      expect(typeof desc).toBe('string');
      expect(desc).toContain('Simple location');
    });

    it('should handle location with no description', async () => {
      await loadTestLocations(api, [
        {
          name: 'emptyloc',
          code: [],
          description: [],
          actions: [],
        },
      ]);

      const desc = api.getLocationDescription('emptyloc');
      expect(typeof desc).toBe('string');
      expect(desc).toBe('');
    });

    it('should handle non-existent location', async () => {
      await runTestFile(api, `'test'`);

      const desc = api.getLocationDescription('nonexistent');
      expect(typeof desc).toBe('string');
      expect(desc).toBe('');
    });

    it('should handle empty location name', () => {
      const desc = api.getLocationDescription('');
      expect(typeof desc).toBe('string');
      expect(desc).toBe('');
    });
  });
});