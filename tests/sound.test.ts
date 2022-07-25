import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('sound', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('PLAY should trigger sound playing with defined volume', () => {
    const onPlay = jest.fn();
    api.on('play_file', onPlay);
    runTestFile(api, `PLAY 'sound/music.mp3',50`);
    expect(error).not.toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalledWith('sound/music.mp3', 50, expect.any(Function));
  });

  test('PLAY should trigger sound playing with 100% volume by default', () => {
    const onPlay = jest.fn();
    api.on('play_file', onPlay);
    runTestFile(api, `PLAY 'sound/music.mp3'`);
    expect(error).not.toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalledWith('sound/music.mp3', 100, expect.any(Function));
  });

  test('PLAY should pause flow untill released', () => {
    const onPlay = jest.fn();
    api.on('play_file', onPlay);
    const statsChanged = jest.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(api, `PLAY 'sound/music.mp3' & p 'after play'`);
    expect(statsChanged).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onPlay.mock.calls[0][2] as Function)();
    expect(error).not.toHaveBeenCalled();
    expect(statsChanged).toHaveBeenCalledWith('after play');
  });

  test('ISPLAY resolves to play status', () => {
    const onIsPlay = jest.fn();
    api.on('is_play', onIsPlay);
    runTestFile(api, `playing = ISPLAY('test.mp3')`);
    expect(onIsPlay).toHaveBeenCalledWith('test.mp3', expect.any(Function));
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onIsPlay.mock.calls[0][1] as Function)(1);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariableNumber('playing')).toBe(1);
  });

  test('CLOSE should trigger stopiing file', () => {
    const onCloseFile = jest.fn();
    api.on('close_file', onCloseFile);
    const onPlay = jest.fn();
    api.on('play_file', onPlay);
    runTestFile(api, `PLAY 'test.mp3' & CLOSE 'test.mp3'`);
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onPlay.mock.calls[0][2] as Function)();
    expect(error).not.toHaveBeenCalled();
    expect(onCloseFile).toHaveBeenCalledWith('test.mp3', expect.any(Function));
  });

  test('CLOSE should not be triggered if no file started playing', () => {
    const onCloseFile = jest.fn();
    api.on('close_file', onCloseFile);
    runTestFile(api, `CLOSE 'test.mp3'`);
    expect(error).not.toHaveBeenCalled();
    expect(onCloseFile).not.toHaveBeenCalled();
  });

  test('CLOSE ALL should trigger stopiing sound', () => {
    const onCloseFile = jest.fn();
    api.on('close_file', onCloseFile);
    const onPlay = jest.fn();
    api.on('play_file', onPlay);
    runTestFile(api, `PLAY 'test.mp3' & CLOSE ALL`);
    // eslint-disable-next-line @typescript-eslint/ban-types
    (onPlay.mock.calls[0][2] as Function)();
    expect(error).not.toHaveBeenCalled();
    expect(onCloseFile).toHaveBeenCalledWith('', expect.any(Function));
  });

  test('CLOSE ALL should not be triggered when no file was played', () => {
    const onCloseFile = jest.fn();
    api.on('close_file', onCloseFile);
    runTestFile(api, `CLOSE ALL`);
    expect(error).not.toHaveBeenCalled();
    expect(onCloseFile).not.toHaveBeenCalled();
  });
});
