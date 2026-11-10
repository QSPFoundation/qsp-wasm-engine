import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { readQsps } from '@qsp/converters';
import { loadTestLocations, prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('current location and state', () => {
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

  test('getCurrentLocation reads $CURLOC, not the location executing code', async () => {
    await loadTestLocations(
      api,
      readQsps(`# start
--- start ---

# hall
gs 'helper'
--- hall ---

# helper
msg 'in helper'
--- helper ---`),
    );
    expect(api.getCurrentLocation()).toBe('');
    await api.restartGame();
    expect(api.getCurrentLocation()).toBe('start');

    let inDialog;
    api.on('msg', (_text, close) => {
      inDialog = { current: api.getCurrentLocation(), executing: api.getCurrentState().loc };
      close();
    });
    await api.execCode(`gt 'hall'`);
    expect(inDialog).toEqual({ current: 'hall', executing: 'helper' });
    expect(api.getCurrentLocation()).toBe('hall');
  });

  test('getCurrentState points at the statement waiting in a dialog', async () => {
    let state;
    api.on('msg', (_text, close) => {
      state = api.getCurrentState();
      close();
    });
    await runTestFile(api, `x = 1\nmsg 'hi'`);
    expect(state).toEqual({ loc: 'test', actIndex: -1, line: 2 });
    expect(api.getCurrentState().loc).toBe('');
  });
});
