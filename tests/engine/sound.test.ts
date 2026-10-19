import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile, startTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

describe('sound', () => {
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

  test('PLAY should trigger sound playing with defined volume', async () => {
    const onPlay = vi.fn();
    api.on('play_file', onPlay);
    const { done } = await startTestFile(api, `PLAY 'sound/music.mp3',50`);

    expect(onPlay).toHaveBeenCalledWith('sound/music.mp3', 50, expect.any(Function));
    onPlay.mock.calls[0][2]();
    await done;
  });

  test('PLAY should trigger sound playing with 100% volume by default', async () => {
    const onPlay = vi.fn();
    api.on('play_file', onPlay);
    const { done } = await startTestFile(api, `PLAY 'sound/music.mp3'`);

    expect(onPlay).toHaveBeenCalledWith('sound/music.mp3', 100, expect.any(Function));
    onPlay.mock.calls[0][2]();
    await done;
  });

  test('PLAY should pause flow until released', async () => {
    const onPlay = vi.fn();
    api.on('play_file', onPlay);
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    const { done } = await startTestFile(api, `PLAY 'sound/music.mp3' & p 'after play'`);
    expect(statsChanged).not.toHaveBeenCalled();
    onPlay.mock.calls[0][2]();
    await done;

    expect(statsChanged).toHaveBeenCalledWith('after play');
  });

  test('ISPLAY resolves to playing status', async () => {
    const onIsPlay = vi.fn();
    api.on('is_play', onIsPlay);
    const { done } = await startTestFile(api, `playing = ISPLAY('test.mp3')`);
    expect(onIsPlay).toHaveBeenCalledWith('test.mp3', expect.any(Function));
    onIsPlay.mock.calls[0][1](1);
    await done;

    expect(api.readVariable('playing')).toBe(1);
  });

  test('CLOSE should trigger stopping file', async () => {
    const onCloseFile = vi.fn((_file: string, resolve: () => void) => resolve());
    api.on('close_file', onCloseFile);
    api.on('play_file', (_file, _volume, resolve) => resolve());

    await runTestFile(api, `PLAY 'test.mp3' & CLOSE 'test.mp3'`);

    expect(onCloseFile).toHaveBeenCalledWith('test.mp3', expect.any(Function));
  });

  test('CLOSE should not be triggered if no file started playing', async () => {
    const onCloseFile = vi.fn();
    api.on('close_file', onCloseFile);
    await runTestFile(api, `CLOSE 'test.mp3'`);

    expect(onCloseFile).not.toHaveBeenCalled();
  });

  test('CLOSE ALL should trigger stopping sound', async () => {
    const onCloseFile = vi.fn((_file: string, resolve: () => void) => resolve());
    api.on('close_file', onCloseFile);
    api.on('play_file', (_file, _volume, resolve) => resolve());
    await runTestFile(api, `PLAY 'test.mp3' & CLOSE ALL`);

    expect(onCloseFile).toHaveBeenCalledWith('', expect.any(Function));
  });

  test('CLOSE ALL should not be triggered when no file was played', async () => {
    const onCloseFile = vi.fn();
    api.on('close_file', onCloseFile);
    await runTestFile(api, `CLOSE ALL`);

    expect(onCloseFile).not.toHaveBeenCalled();
  });
});
