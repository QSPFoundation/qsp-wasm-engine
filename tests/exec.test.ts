import { Mock } from 'jest-mock';
import { jest } from '@jest/globals';

import { prepareApi, runTestFile } from "../src/test-helpers";
import { QspAPI } from '../src';

describe('exec', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  it('should trigger callback', () => {
    const onSystemCmd = jest.fn();
    api.on('system_cmd', onSystemCmd);

    runTestFile(api, `exec('test')`);

    expect(error).not.toHaveBeenCalled();
    expect(onSystemCmd).toHaveBeenCalledWith('test');
  });

  it('should update ui on call', () => {
    const onMain = jest.fn();
    api.on('main_changed', onMain);

    runTestFile(api, `*p 'before' & exec('test') & *p '-after'`);

    expect(error).not.toHaveBeenCalled();
    expect(onMain).toHaveBeenCalledTimes(2);
    expect(onMain).toBeCalledWith('before');
    expect(onMain).toBeCalledWith('before-after');
  })
})