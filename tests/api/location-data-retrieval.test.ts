import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, loadTestLocations } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('location data retrieval API', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  it('getLocationsList should return all location names', () => {
    runTestFile(
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

  it('getLocationCode should return location source code', () => {
    runTestFile(
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

  it('getLocationActions should return base actions for a location', () => {
    loadTestLocations(api, [
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

  it('getActionCode should work with location base actions', () => {
    loadTestLocations(api, [
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

  it('getLocationCode should return empty array for non-existent location', () => {
    runTestFile(api, `*p 'test'`);

    const code = api.getLocationCode('nonexistent');
    expect(code).toEqual([]);
  });

  it('getActionCode should return empty array for non-existent action', () => {
    runTestFile(api, ``);

    const code = api.getActionCode('test', 5);
    expect(code).toEqual([]);
  });

  it('should read list of locations (debug)', () => {
    runTestFile(api, '');
    const locations = api.getLocationsList();
    expect(locations).toEqual(['start', 'test']);
  });

  it('should read location code (debug)', () => {
    runTestFile(
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
    it('should return description for location with static description', () => {
      loadTestLocations(api, [
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

    it('should return description for location with single line description', () => {
      loadTestLocations(api, [
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

    it('should handle location with no description', () => {
      loadTestLocations(api, [
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

    it('should handle non-existent location', () => {
      runTestFile(api, `'test'`);

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