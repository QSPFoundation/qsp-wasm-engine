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
    test('single line line if true', () => {
      runTestFile(
        api,
        `
x = 1 & y = 2
if x = 1: y = 1
    `,
      );

      expect(api.readVariable('y')).toBe(1);
    });
    test('single line line if false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: y = 1
    `,
      );

      expect(api.readVariable('y')).toBe(2);
    });

    test('single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: y = 1 else y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('single line elseif', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: y = 1 elseif x = 2: y = 4 else y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(4);
    });

    test('single line else if ', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1: y = 1 else if x = 2: y = 4 else y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(4);
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

    test('multi line else if false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
else
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line else if true', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 2:
  y = 1
else
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(1);
    });

    test('multi line after end if true', () => {
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
    });
    test('multi line after end if false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 1
end & y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line after else end if false', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  x = 1
else
  x = 3
end & y = 3
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line after else end if true', () => {
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
    });

    test('multi line else with colon', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
else:
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line with single line else with colon', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
else: y = 3
  y = 4
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line with single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
else y = 4
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(4);
    });

    test('multi line with 2 single line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
else y = 3
  y = 4
else y = 5
  y = 6
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line with 2 multi line else', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
else
  y = 4
else
  y = 6
end
    `,
      );

      expect(api.readVariable('y')).toBe(4);
    });

    test('multi line elseif with else', () => {
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
    `,
      );

      expect(api.readVariable('y')).toBe(4);
    });

    test('multi line with single line elseif', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
elseif x = 2: y = 3
  y = 4
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line with 2 single line elseif', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
elseif x = 3: y = 4
elseif x = 2: y = 5
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(5);
    });

    test('multi line else with 2 single line elseif', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
elseif x = 3: y = 4
elseif x = 4: y = 5
else
  y = 3
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
    });

    test('multi line else and mixed elseif', () => {
      runTestFile(
        api,
        `
x = 2 & y = 2
if x = 1:
  y = 1
elseif x = 3: y = 4
elseif x = 2:
  y = 3
else
  y = 5
end
    `,
      );

      expect(api.readVariable('y')).toBe(3);
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
    `,
      );

      expect(api.readVariable('out')).toBe(7);
    });

    test('wrong condition form', () => {
      runTestFile(
        api,
        `
if abcd=3: k1=34
    k2=35 & ! this will be executed because if is single line
end 
      `,
      );

      expect(api.readVariable('k1')).toBe(0);
      expect(api.readVariable('k2')).toBe(35);
    });

    test('end in single line if will show error', () => {
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

    test('error for else if', () => {
      runTestFile(
        api,
        `
absd=6
if absd=3:
  k=34
else if absd=6: k1=25
end
      `,
      );

      expect(api.readVariable('k')).toBe(0);
      expect(api.readVariable('k1')).toBe(25);
    });
  });
});
