import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../../src/test-helpers';
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
    api._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });

  test('PLAY should trigger sound playing with defined volume', () => {
    const onPlay = vi.fn();
    api.on('play_file', onPlay);
    runTestFile(api, `PLAY 'sound/music.mp3',50`);

    expect(onPlay).toHaveBeenCalledWith('sound/music.mp3', 50, expect.any(Function));
    onPlay.mock.calls[0][2]();
  });

  test('PLAY should trigger sound playing with 100% volume by default', () => {
    const onPlay = vi.fn();
    api.on('play_file', onPlay);
    runTestFile(api, `PLAY 'sound/music.mp3'`);

    expect(onPlay).toHaveBeenCalledWith('sound/music.mp3', 100, expect.any(Function));
    onPlay.mock.calls[0][2]();
  });

  test('PLAY should pause flow until released', () => {
    const onPlay = vi.fn();
    api.on('play_file', onPlay);
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(api, `PLAY 'sound/music.mp3' & p 'after play'`);
    expect(statsChanged).not.toHaveBeenCalled();
    onPlay.mock.calls[0][2]();

    expect(statsChanged).toHaveBeenCalledWith('after play');
  });

  test('ISPLAY resolves to playing status', () => {
    const onIsPlay = vi.fn();
    api.on('is_play', onIsPlay);
    runTestFile(api, `playing = ISPLAY('test.mp3')`);
    expect(onIsPlay).toHaveBeenCalledWith('test.mp3', expect.any(Function));
    onIsPlay.mock.calls[0][1](1);

    expect(api.readVariable('playing')).toBe(1);
  });

  test('CLOSE should trigger stopping file', () => {
    const onCloseFile = vi.fn();
    api.on('close_file', onCloseFile);
    const onPlay = vi.fn();
    api.on('play_file', onPlay);

    runTestFile(api, `PLAY 'test.mp3' & CLOSE 'test.mp3'`);
    onPlay.mock.calls[0][2]();

    expect(onCloseFile).toHaveBeenCalledWith('test.mp3', expect.any(Function));
    onCloseFile.mock.calls[0][1]();
  });

  test('CLOSE should not be triggered if no file started playing', () => {
    const onCloseFile = vi.fn();
    api.on('close_file', onCloseFile);
    runTestFile(api, `CLOSE 'test.mp3'`);

    expect(onCloseFile).not.toHaveBeenCalled();
  });

  test('CLOSE ALL should trigger stopping sound', () => {
    const onCloseFile = vi.fn();
    api.on('close_file', onCloseFile);
    const onPlay = vi.fn();
    api.on('play_file', onPlay);
    runTestFile(api, `PLAY 'test.mp3' & CLOSE ALL`);
    onPlay.mock.calls[0][2]();

    expect(onCloseFile).toHaveBeenCalledWith('', expect.any(Function));
    onCloseFile.mock.calls[0][1]();
  });

  test('CLOSE ALL should not be triggered when no file was played', () => {
    const onCloseFile = vi.fn();
    api.on('close_file', onCloseFile);
    runTestFile(api, `CLOSE ALL`);

    expect(onCloseFile).not.toHaveBeenCalled();
  });
});
