import { Mock, beforeEach, describe, vi, it, expect, afterEach } from 'vitest';
import { delay, prepareApi, runTestFile } from '../../src/test-helpers';
import { QspAPI } from '../../src/contracts/api';

// TODO add save/load test
describe('api', () => {
  let api: QspAPI;
  let error: Mock;
  beforeEach(async () => {
    api = await prepareApi();
    error = vi.fn();
    api.on('error', error);
  });
  afterEach(() => {
    api?._cleanup();
    expect(error).not.toHaveBeenCalled();
    api?._run_checks();
  });


  it('should exec code', () => {
    const statsChanged = vi.fn();
    api.on('stats_changed', statsChanged);
    runTestFile(api, ``);
    expect(statsChanged).not.toHaveBeenCalled();
    api.execCode(`p 'works'`);
    expect(statsChanged).toHaveBeenCalledWith('works');
  });

  it('should read version', () => {
    expect(api.version()).toEqual('5.9.5');
  });

  it('should watch variable by index', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    api.watchVariableByIndex('$test', 1, watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('');
    api.execCode(`$test[1] = 'abc'`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('abc');
  });

  it('should see variable change before msg', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    const msg = vi.fn();
    api.on('msg', msg);

    api.watchVariableByIndex('$test', 1, watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('');
    api.execCode(`$test[1] = "ab" & msg "test"`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('ab');
    msg.mock.calls[0][1]();
  });

  it('should watch variable by key', async () => {
    runTestFile(api, ``);
    const watchVariables = vi.fn();
    api.watchVariableByKey('$test', 'key', watchVariables);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('');
    api.execCode(`$test['key'] = "ab"`);
    await delay(10);
    expect(watchVariables).toHaveBeenCalledWith('ab');
  });

  describe('expression evaluation', () => {
    beforeEach(() => {
      runTestFile(api, `
        numVar = 10
        $strVar = 'hello'
        %arrVar[0] = 5
        %arrVar[1] = 15
      `);
    });

    it('should evaluate string expressions', () => {
      const result = api.calculateStringExpression('$strVar + " world"');
      expect(result).toBe('hello world');
    });

    it('should evaluate numeric expressions', () => {
      const result = api.calculateNumericExpression('numVar * 2');
      expect(result).toBe(20);
    });

    it('should evaluate complex string expressions', () => {
      const result = api.calculateStringExpression('$ucase($strVar) + " " + $lcase("WORLD")');
      expect(result).toBe('HELLO world');
    });

    it('should evaluate complex numeric expressions', () => {
      const result = api.calculateNumericExpression('(numVar + 5) * 2 - 10');
      expect(result).toBe(20);
    });

    it('should handle array access in expressions', () => {
      const result = api.calculateNumericExpression('%arrVar[0] + %arrVar[1]');
      expect(result).toBe(20);
    });

    it('should return null for invalid expressions in calculateStringExpression', () => {
      expect(api.calculateStringExpression('invalid syntax [')).toBe('');
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: 'Unknown action!',
        errorCode: 29,
        line: 0,
        lineSrc: '',
        localLine: 0,
        location: '',
      });
      error.mockClear();
    });

    it('should return null for invalid expressions in calculateNumericExpression', () => {
      expect(api.calculateNumericExpression('invalid syntax [')).toBe(null);
      expect(error).toHaveBeenCalledWith({
        actionIndex: -1,
        description: 'Unknown action!',
        errorCode: 29,
        line: 0,
        lineSrc: '',
        localLine: 0,
        location: '',
      });
      error.mockClear();
    });

    it('should handle empty string expression', () => {
      const result = api.calculateStringExpression('""');
      expect(result).toBe('');
    });
  });

  describe('selection getters', () => {
    beforeEach(() => {
      runTestFile(api, `
        act 'Action 1': end
        act 'Action 2': end
        addobj 'Object 1'
        addobj 'Object 2'
      `);
    });

    it('should get selected action index', () => {
      const initialIndex = api.getSelectedActionIndex();
      expect(initialIndex).toBe(-1)

      api.selectAction(1);
      expect(api.getSelectedActionIndex()).toBe(1);

      api.selectAction(0);
      expect(api.getSelectedActionIndex()).toBe(0);
    });

    it('should get selected object index', () => {
      const initialIndex = api.getSelectedObjectIndex();
      expect(initialIndex).toBeGreaterThanOrEqual(-1);

      api.selectObject(1);
      expect(api.getSelectedObjectIndex()).toBe(1);

      api.selectObject(0);
      expect(api.getSelectedObjectIndex()).toBe(0);
    });
  });

  describe('utility functions', () => {
    it('should get compiled date time', () => {
      const dateTime = api.getCompiledDateTime();
      expect(dateTime.length).toBeGreaterThan(0);
    });

    it('should get error descriptions', () => {
      const desc = api.getErrorDescription(11); // QSP_ERR_DIVBYZERO
      expect(desc).toBe('Division by zero!');
    });

    it('should handle window show/hide', () => {
      expect(() => {
        api.showWindow(1, false);
        api.showWindow(1, true);
      })
    });
  });
});
