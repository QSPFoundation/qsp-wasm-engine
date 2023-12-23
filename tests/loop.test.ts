import { Mock, beforeEach, describe, vi, test, expect } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('strings', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });

  test('loop should not start if condition not met', () => {
    runTestFile(
      api,
      `
i = 1
x = 1
loop while i > 1: x += 1
    `,
    );

    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(1);
  });

  test('loop should stop if condition is change inside loop', () => {
    runTestFile(
      api,
      `
i = 1
x = 1
loop while i < 5: x += 1 & i = 10  
`,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(2);
  });

  test('step should be called on every loop run', () => {
    runTestFile(
      api,
      `
loop i = 1 while i < 10 step i += 2: x+=1
`,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(5);
  });

  test('local vars should be for loop only', () => {
    runTestFile(
      api,
      `
i = 5
loop local i = 1 while i < 10 step i+=2: x+=1
`,
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('x')).toBe(5);
    expect(api.readVariable('i')).toBe(5);
  });
});
