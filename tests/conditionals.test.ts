import { Mock, beforeEach, describe, vi, test, expect, afterEach } from 'vitest';
import { prepareApi, runTestFile } from '../src/test-helpers';
import { QspAPI } from '../src/contracts/api';

describe('conditionals', () => {
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

  test('IIF true', () => {
    runTestFile(api, `x = 1 & abs_x = IIF(x > 0, x, -x)`);

    expect(api.readVariable('abs_x')).toBe(1);
  });
  test('IIF false', () => {
    runTestFile(api, `x = -1 & abs_x = IIF(x > 0, x, -x)`);

    expect(api.readVariable('abs_x')).toBe(1);
  });

  describe('single line if', () => {
    test('single line if true', () => {
      runTestFile(
        api,
        `
x = 1 & y = 2
if x = 1: y = 1
    `,
      );

      expect(api.readVariable('y')).toBe(1);
    });

    test('single line if false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: y = 1
    `,
      );

      expect(api.readVariable('y')).toBe(2);
    });

    test('single line if true with else', () => {
      runTestFile(
        api,
        `
x = 2
if x = 2: x = 3 else x = 4
    `,
      );

      expect(api.readVariable('x')).toBe(3);
    });

    test('single line if false with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 else y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if true with elseif', () => {
      runTestFile(
        api,
        `
x = 2
if x = 2: x = 3 elseif x = 2: x = 4
    `,
      );

      expect(api.readVariable('x')).toBe(3);
    });

    test('single line if false with elseif true', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 elseif x = 2: y = 4
    `,
      );

      expect(api.readVariable('y')).toBe(4);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if false with elseif false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 4 elseif x = 3: y = 4
    `,
      );

      expect(api.readVariable('y')).toBe(2);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if false with elseif true with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 elseif x = 2: y = 4 else x = 4
    `,
      );

      expect(api.readVariable('y')).toBe(4);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if false with elseif false with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 elseif x = 3: x = 4 else y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if false with else if true', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 else if x = 2: y = 4
    `,
      );

      expect(api.readVariable('y')).toBe(4);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if false with else if false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 else if x = 3: y = 4
    `,
      );

      expect(api.readVariable('y')).toBe(2);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if false with else if true with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 else if x = 2: y = 4 else x = 4
    `,
      );

      expect(api.readVariable('y')).toBe(4);
      expect(api.readVariable('x')).toBe(2);
    });

    test('single line if false with else if false with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: x = 3 else if x = 3: x = 4 else y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });
  });

  describe('multi line if', () => {
    test('multi line if true', () => {
      runTestFile(
        api,
        `
x = 1 & y = 2
if x = 1:
  y = 1
end
    `,
      );

      expect(api.readVariable('y')).toBe(1);
    });
    test('multi line if false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
end
    `,
      );

      expect(api.readVariable('y')).toBe(2);
    });

    test('multi line if false with multi line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if true with multi line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 2:
  y = 1
else
  x = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(1);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if true with multi line elseif', () => {
      runTestFile(
        api,
        `
x = 2
if x = 2:
  x = 3
elseif x = 2:
  x = 4
else
  x = 5
end
    `,
      );

      expect(api.readVariable('x')).toBe(3);
    });

    test('multi line if true with single line else', () => {
      runTestFile(
        api,
        `
x = 2
if x = 2:
  x = 3
else if x = 2: x = 4
  x = 5
end
    `,
      );

      expect(api.readVariable('x')).toBe(3);
    });

    test('multi line if true with single line elseif', () => {
      runTestFile(
        api,
        `
x = 2
if x = 2:
  x = 3
elseif x = 2: x = 4
  x = 5
end
    `,
      );

      expect(api.readVariable('x')).toBe(3);
    });

    test('multi line if true with code after end', () => {
      runTestFile(
        api,
        `
x = 1 & y = 2
if x = 1:
  x = 2
end & y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });
    test('multi line if false with code after end', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
end & y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with multi line else with code after end', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else
  x = 4
end & y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(4);
    });

    test('multi line if true with multi line else with code after end', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 2:
  x = 1
else
  x = 3
end & y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(1);
    });

    test('multi line if false with multi line else with colon', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else:
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with single line else with colon', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 1
else: y = 3
  x = 4
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else y = 4
  x = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(4);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with 2 single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else y = 3
  x = 4
else y = 5
  x = 6
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with 2 multi line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else
  y = 4
else
  x = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(4);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with multi line elseif true with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 2:
  y = 4
else
  x = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(4);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with multi line elseif false with multi line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3:
  x = 4
else
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with multi line elseif false with single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3:
  x = 4
else y = 3
  x = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with single line elseif true', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 2: y = 3
  x = 4
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with single line elseif false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3: y = 3
  x = 4
end
    `,
      );

      expect(api.readVariable('y')).toBe(2);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with 2 single line elseif true', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3: x = 4
elseif x = 2: y = 5
  x = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(5);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with 2 single line elseif false with multi line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3: x = 4
elseif x = 4: x = 5
else
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with 2 single line elseif false with single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3: x = 4
elseif x = 4: x = 5
else y = 3
  x = 6
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with 2 multi line elseif true', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3:
  x = 4
elseif x = 2:
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with 2 multi line elseif false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3:
  x = 4
elseif x = 4:
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(2);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with mixed elseif true with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
elseif x = 3: x = 4
elseif x = 2:
  y = 3
else
  x = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with multi line else if true with else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else if x = 2:
  y = 3 & ! 'else if' gets converted to 'elseif'
else
  x = 4
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with multi line else if false with multi line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else if x = 3:
  x = 4
else
  y = 3 & ! 'else if' gets converted to 'elseif'
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if false with multi line else if false with single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 3
else if x = 3:
  x = 4
else y = 3 & ! 'else if' gets converted to 'elseif'
  x = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
      expect(api.readVariable('x')).toBe(2);
    });

    test('multi line if nested', () => {
      runTestFile(
        api,
        `
x = 1 & y = 1 & z = 1 & out = 1
if x = 1:
    x = 2
    if y = 2:
      x = 3
    elseif y = 1:
      x = 4
      if z = 2: x = 6 else out = 7
    else
      x = 5
    end
end
    `,
      );

      expect(api.readVariable('out')).toBe(7);
      expect(api.readVariable('x')).toBe(4);
    });

    test('wrong multi line if', () => {
      runTestFile(
        api,
        `
if abcd = 3: k1 = 34
    k2 = 35 & ! this will be executed because if is single line
end
      `,
      );

      expect(api.readVariable('k1')).toBe(0);
      expect(api.readVariable('k2')).toBe(35);
    });

    test('multi line if without end shows error', () => {
      runTestFile(
        api,
        `
if abcd = 3:
  k1 = 34
else
  k1 = 25
        `,
      );
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: '[end] not found!',
        errorCode: 111,
        line: 2,
        lineSrc: 'IF ABCD = 3:',
        localLine: 2,
        location: 'test',
      });
      error.mockReset();
    });

    test('nested multi line if without end shows error', () => {
      runTestFile(
        api,
        `
abc = 4
if abc <> 3:
  k1 = 34
  if abc = 4:
    k1 = 25
end
        `,
      );
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: '[end] not found!',
        errorCode: 111,
        line: 3,
        lineSrc: 'IF ABC <> 3:',
        localLine: 3,
        location: 'test',
      });
      error.mockReset();
    });

    test('end in single line if shows error', () => {
      runTestFile(
        api,
        `
        if abcd=3: k1=34 else k1=25 end
        `,
      );
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: 'Unknown action!',
        errorCode: 118,
        line: 2,
        lineSrc: 'IF ABCD=3: K1=34 ELSE K1=25 END',
        localLine: 2,
        location: 'test',
      });
      error.mockReset();
    });
  });
});
