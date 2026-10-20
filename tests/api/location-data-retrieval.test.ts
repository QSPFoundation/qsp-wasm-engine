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
    expect(api.getLocationCode('big')).toEqual(lines);
    expect(api.getActionCode('big', 0)).toEqual(lines);
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
        expect.stringContaining("*P 'main location'"),
        expect.stringContaining('X = 1'),
        expect.stringContaining("$NAME = 'test'"),
      ]),
    );

    const secondLocationCode = api.getLocationCode('second');
    expect(secondLocationCode).toEqual(
      expect.arrayContaining([
        expect.stringContaining("*P 'second location'"),
        expect.stringContaining('Y = 2'),
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

  it('getActionCode should work with location base actions', async () => {
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

    const code = api.getActionCode('test', 0);
    expect(code).toEqual(expect.arrayContaining(['X = 1', "$NAME = 'test'"]));

    const code2 = api.getActionCode('test', 1);
    expect(code2).toEqual(expect.arrayContaining(['X = 2', "$NAME = 'test'"]));
  });

  it('getLocationCode should return empty array for non-existent location', async () => {
    await runTestFile(api, `*p 'test'`);

    const code = api.getLocationCode('nonexistent');
    expect(code).toEqual([]);
  });

  it('getActionCode should return empty array for non-existent action', async () => {
    await runTestFile(api, ``);

    const code = api.getActionCode('test', 5);
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

    expect(code).toEqual(["'first line'", '', "ACT 'first act':", "'something'", 'END']);
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