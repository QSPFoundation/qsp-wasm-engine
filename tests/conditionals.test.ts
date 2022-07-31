import { prepareApi, runTestFile } from '../src/test-helpers';
import { jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { QspAPI } from '../src/contracts/api';

describe('conditionals', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = jest.fn();
    api.on('error', error);
  });

  test('IIF true', () => {
    runTestFile(api, `x = 1 & abs_x = IIF(x > 0, x, -x)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('abs_x')).toBe(1);
  });
  test('IIF false', () => {
    runTestFile(api, `x = -1 & abs_x = IIF(x > 0, x, -x)`);
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('abs_x')).toBe(1);
  });

  test('single line line if true', () => {
    runTestFile(
      api,
      `
x = 1 & y = 2
if x = 1: y = 1
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(1);
  });
  test('single line line if false', () => {
    runTestFile(
      api,
      `
x = 2 & y = 2
if x = 1: y = 1
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(2);
  });

  test('single line else', () => {
    runTestFile(
      api,
      `
x = 2 & y = 2
if x = 1: y = 1 else y = 3
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(3);
  });
  test.skip('single line elseif ', () => {
    runTestFile(
      api,
      `
x = 2 & y = 2
if x = 1: y = 1 elseif x = 2: y = 4 else y = 3
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(4);
  });

  test('multi line if true', () => {
    runTestFile(
      api,
      `
x = 1 & y = 2
if x = 1:
  y = 1
end
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(1);
  });
  test('multi line line if false', () => {
    runTestFile(
      api,
      `
x = 2 & y = 2
if x = 1:
  y = 1
end
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(2);
  });

  test('multi line else', () => {
    runTestFile(
      api,
      `
x = 2 & y = 2
if x = 1:
  y = 1
else
  y = 3
end
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(3);
  });
  test('multi line elseif ', () => {
    runTestFile(
      api,
      `
x = 2 & y = 2
if x = 1:
  y = 1
elseif x = 2:
  y = 4
else
  y = 3
end
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('y')).toBe(4);
  });

  test('multi line nested', () => {
    runTestFile(
      api,
      `
x = 1 & y = 1 & z =  1 & out = 1
if x = 1:
    out = 2
    if y = 2:
      out = 3
    elseif y = 1:
      out = 4
      if z = 2: out = 6 else out = 7
    else
      out = 5
    end
end
    `
    );
    expect(error).not.toHaveBeenCalled();
    expect(api.readVariable('out')).toBe(7);
  });
});
