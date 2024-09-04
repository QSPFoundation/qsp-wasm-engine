import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('loop', () => {
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

  test('loop should not start if condition not met', () => {
    runTestFile(
      api,
      `
i = 1
x = 1
loop while i > 1: x += 1
    `,
    );

    expect(api.readVariable('x')).toBe(1);
  });

  test('loop should stop if condition is changed inside loop', () => {
    runTestFile(
      api,
      `
i = 1
x = 1
loop while i < 5: x += 1 & i = 10  
`,
    );

    expect(api.readVariable('x')).toBe(2);
  });

  test('step should be called on every loop run', () => {
    runTestFile(
      api,
      `
loop i = 1 while i < 10 step i += 2: x+=1
`,
    );

    expect(api.readVariable('x')).toBe(5);
  });

  test('local vars should be for loop only', () => {
    runTestFile(
      api,
      `
i = 5
loop local i = 1 while i < 10 step i+=2: x+=1
z = i
`,
    );

    expect(api.readVariable('x')).toBe(5);
    expect(api.readVariable('i')).toBe(5);
    expect(api.readVariable('z')).toBe(5);
  });

  test('processing arrays with loop', () => {
    runTestFile(
      api,
      `
mass[] = 23
mass[2] = 45
summ=0
loop local i, size = 0, arrsize('mass') while i < size step i += 1:
    summ += mass[i]
end
      `,
    );

    expect(api.readVariable('summ')).toBe(68);
  });

  test('EXIT stops whole location not just loop', () => {
    runTestFile(
      api,
      `
        x = 0 & y = 1
        loop local i = 1 while i < 10 step i+=1:
          x+=i
          if i = 5: exit
        end
        y = 2
      `,
    );

    expect(api.readVariable('x')).toBe(15);
    expect(api.readVariable('y')).toBe(1);
  });

  test('can JUMP outside loop', () => {
    runTestFile(
      api,
      `
        x = 0 & y = 0
        loop local i = 1 while i < 10 step i+=1:
          x+=2
          if i = 5: jump 'endloop'
        end
        :endloop
        y = 2
      `,
    );

    expect(api.readVariable('x')).toBe(10);
    expect(api.readVariable('y')).toBe(2);
  });
});
