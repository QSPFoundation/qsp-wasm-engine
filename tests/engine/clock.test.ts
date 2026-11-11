import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { readQsps } from '@qsp/converters';
import { loadTestLocations, prepareApi } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('clock', () => {
  let apis: QspAPI[];
  let error: Mock;
  beforeEach(() => {
    apis = [];
    error = vi.fn();
  });
  afterEach(() => {
    for (const api of apis) api.dispose();
    expect(error).not.toHaveBeenCalled();
    for (const api of apis) api._run_checks();
  });

  async function createApi(seed?: number): Promise<QspAPI> {
    const api = await prepareApi(seed);
    api.on('error', error);
    apis.push(api);
    return api;
  }

  // Every restart runs the start location, which draws r
  async function drawOnRestarts(seed: number, restarts: number, now = 0): Promise<number[]> {
    const api = await createApi(seed);
    api.setClock(() => now);
    await loadTestLocations(api, readQsps(`# start\nr = rand(1, 1000000000)\n--- start ---`));
    const values: number[] = [];
    for (let i = 0; i < restarts; ++i) {
      await api.restartGame();
      values.push(api.readVariable('#r'));
    }
    return values;
  }

  test('the same seed gives the same rand values in two engines, whatever the clock', async () => {
    const values = await drawOnRestarts(42, 1, 1_700_000_000_000);
    expect(await drawOnRestarts(42, 1, 1_700_003_600_000)).toEqual(values);
  });

  test('restarts continue the sequence, which the same seed reproduces', async () => {
    const values = await drawOnRestarts(42, 2);
    expect(values[1]).not.toBe(values[0]);
    expect(await drawOnRestarts(42, 2)).toEqual(values);
  });

  test('another seed gives other rand values', async () => {
    const values = await drawOnRestarts(42, 2);
    expect(await drawOnRestarts(43, 2)).not.toEqual(values);
  });

  test('msecscount follows the clock', async () => {
    const api = await createApi();
    let t = 5000;
    api.setClock(() => t);
    await loadTestLocations(api, readQsps(`# start\n--- start ---`));
    await api.restartGame();
    t += 1500;
    await api.execCode('n = msecscount');
    expect(api.readVariable('n')).toBe(1500);
  });
});
