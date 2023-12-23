import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('api', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('long line split', () => {
    runTestFile(
      api,
      `
t = 1
tort = 0
if t _
   or _
   t:
  $type = 'new'
else
  $type = 'old'
end
    `,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('$type')).toBe('new');
  });
});
