async function createQspModule(moduleArg = {}) {
  var moduleRtn;
  var Module = moduleArg;
  var ENVIRONMENT_IS_WEB = !!globalThis.window;
  var ENVIRONMENT_IS_WORKER = !!globalThis.WorkerGlobalScope;
  var ENVIRONMENT_IS_NODE =
    globalThis.process?.versions?.node && globalThis.process?.type != 'renderer';
  if (ENVIRONMENT_IS_NODE) {
    const { createRequire } = await import('node:module');
    var require = createRequire(import.meta.url);
  }
  var arguments_ = [];
  var thisProgram = './this.program';
  var quit_ = (status, toThrow) => {
    throw toThrow;
  };
  var _scriptName = import.meta.url;
  var scriptDirectory = '';
  function locateFile(path) {
    if (Module['locateFile']) {
      return Module['locateFile'](path, scriptDirectory);
    }
    return scriptDirectory + path;
  }
  var readAsync, readBinary;
  if (ENVIRONMENT_IS_NODE) {
    var fs = require('node:fs');
    if (_scriptName.startsWith('file:')) {
      scriptDirectory =
        require('node:path').dirname(require('node:url').fileURLToPath(_scriptName)) + '/';
    }
    readBinary = (filename) => {
      filename = isFileURI(filename) ? new URL(filename) : filename;
      var ret = fs.readFileSync(filename);
      return ret;
    };
    readAsync = async (filename, binary = true) => {
      filename = isFileURI(filename) ? new URL(filename) : filename;
      var ret = fs.readFileSync(filename, binary ? undefined : 'utf8');
      return ret;
    };
    if (process.argv.length > 1) {
      thisProgram = process.argv[1].replace(/\\/g, '/');
    }
    arguments_ = process.argv.slice(2);
    quit_ = (status, toThrow) => {
      process.exitCode = status;
      throw toThrow;
    };
  } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    try {
      scriptDirectory = new URL('.', _scriptName).href;
    } catch {}
    {
      if (ENVIRONMENT_IS_WORKER) {
        readBinary = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.responseType = 'arraybuffer';
          xhr.send(null);
          return new Uint8Array(xhr.response);
        };
      }
      readAsync = async (url) => {
        if (isFileURI(url)) {
          return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
              if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                resolve(xhr.response);
                return;
              }
              reject(xhr.status);
            };
            xhr.onerror = reject;
            xhr.send(null);
          });
        }
        var response = await fetch(url, { credentials: 'same-origin' });
        if (response.ok) {
          return response.arrayBuffer();
        }
        throw new Error(response.status + ' : ' + response.url);
      };
    }
  } else {
  }
  var out = console.log.bind(console);
  var err = console.error.bind(console);
  var wasmBinary;
  var ABORT = false;
  var EXITSTATUS;
  var isFileURI = (filename) => filename.startsWith('file://');
  function writeStackCookie() {
    var max = _emscripten_stack_get_end();
    if (max == 0) {
      max += 4;
    }
    HEAPU32[max >> 2] = 34821223;
    HEAPU32[(max + 4) >> 2] = 2310721022;
    HEAPU32[0 >> 2] = 1668509029;
  }
  function checkStackCookie() {
    if (ABORT) return;
    var max = _emscripten_stack_get_end();
    if (max == 0) {
      max += 4;
    }
    var cookie1 = HEAPU32[max >> 2];
    var cookie2 = HEAPU32[(max + 4) >> 2];
    if (cookie1 != 34821223 || cookie2 != 2310721022) {
      abort(
        `Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`,
      );
    }
    if (HEAPU32[0 >> 2] != 1668509029) {
      abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
    }
  }
  var readyPromiseResolve, readyPromiseReject;
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  var HEAP64, HEAPU64;
  var runtimeInitialized = false;
  function updateMemoryViews() {
    var b = wasmMemory.buffer;
    Module['HEAP8'] = HEAP8 = new Int8Array(b);
    Module['HEAP16'] = HEAP16 = new Int16Array(b);
    Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
    Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
    Module['HEAP32'] = HEAP32 = new Int32Array(b);
    Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
    Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
    Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
    HEAP64 = new BigInt64Array(b);
    HEAPU64 = new BigUint64Array(b);
  }
  function preRun() {
    if (Module['preRun']) {
      if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
      while (Module['preRun'].length) {
        addOnPreRun(Module['preRun'].shift());
      }
    }
    callRuntimeCallbacks(onPreRuns);
  }
  function initRuntime() {
    runtimeInitialized = true;
    setStackLimits();
    checkStackCookie();
    wasmExports['g']();
  }
  function postRun() {
    checkStackCookie();
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length) {
        addOnPostRun(Module['postRun'].shift());
      }
    }
    callRuntimeCallbacks(onPostRuns);
  }
  function abort(what) {
    Module['onAbort']?.(what);
    what = 'Aborted(' + what + ')';
    err(what);
    ABORT = true;
    what += '. Build with -sASSERTIONS for more info.';
    var e = new WebAssembly.RuntimeError(what);
    readyPromiseReject?.(e);
    throw e;
  }
  var wasmBinaryFile;
  function findWasmBinary() {
    if (Module['locateFile']) {
      return locateFile('qsp-engine.wasm');
    }
    return new URL('qsp-engine.wasm', import.meta.url).href;
  }
  function getBinarySync(file) {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw 'both async and sync fetching of the wasm failed';
  }
  async function getWasmBinary(binaryFile) {
    if (!wasmBinary) {
      try {
        var response = await readAsync(binaryFile);
        return new Uint8Array(response);
      } catch {}
    }
    return getBinarySync(binaryFile);
  }
  async function instantiateArrayBuffer(binaryFile, imports) {
    try {
      var binary = await getWasmBinary(binaryFile);
      var instance = await WebAssembly.instantiate(binary, imports);
      return instance;
    } catch (reason) {
      err(`failed to asynchronously prepare wasm: ${reason}`);
      abort(reason);
    }
  }
  async function instantiateAsync(binary, binaryFile, imports) {
    if (!binary && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
      try {
        var response = fetch(binaryFile, { credentials: 'same-origin' });
        var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
        return instantiationResult;
      } catch (reason) {
        err(`wasm streaming compile failed: ${reason}`);
        err('falling back to ArrayBuffer instantiation');
      }
    }
    return instantiateArrayBuffer(binaryFile, imports);
  }
  function getWasmImports() {
    var imports = { a: wasmImports };
    return imports;
  }
  async function createWasm() {
    function receiveInstance(instance, module) {
      wasmExports = instance.exports;
      wasmExports = Asyncify.instrumentWasmExports(wasmExports);
      assignWasmExports(wasmExports);
      updateMemoryViews();
      return wasmExports;
    }
    function receiveInstantiationResult(result) {
      return receiveInstance(result['instance']);
    }
    var info = getWasmImports();
    if (Module['instantiateWasm']) {
      return new Promise((resolve, reject) => {
        Module['instantiateWasm'](info, (inst, mod) => {
          resolve(receiveInstance(inst, mod));
        });
      });
    }
    wasmBinaryFile ??= findWasmBinary();
    var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
    var exports = receiveInstantiationResult(result);
    return exports;
  }
  class ExitStatus {
    name = 'ExitStatus';
    constructor(status) {
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }
  }
  var callRuntimeCallbacks = (callbacks) => {
    while (callbacks.length > 0) {
      callbacks.shift()(Module);
    }
  };
  var onPostRuns = [];
  var addOnPostRun = (cb) => onPostRuns.push(cb);
  var onPreRuns = [];
  var addOnPreRun = (cb) => onPreRuns.push(cb);
  var dynCalls = {};
  var noExitRuntime = true;
  var ptrToString = (ptr) => {
    ptr >>>= 0;
    return '0x' + ptr.toString(16).padStart(8, '0');
  };
  var setStackLimits = () => {
    var stackLow = _emscripten_stack_get_base();
    var stackHigh = _emscripten_stack_get_end();
    ___set_stack_limits(stackLow, stackHigh);
  };
  var ___handle_stack_overflow = (requested) => {
    var base = _emscripten_stack_get_base();
    var end = _emscripten_stack_get_end();
    abort(
      `stack overflow (Attempt to set SP to ${ptrToString(requested)}` +
        `, with stack limits [${ptrToString(end)} - ${ptrToString(base)}` +
        ']). If you require more stack space build with -sSTACK_SIZE=<bytes>',
    );
  };
  var _emscripten_date_now = () => Date.now();
  var getHeapMax = () => 2147483648;
  var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
  var growMemory = (size) => {
    var oldHeapSize = wasmMemory.buffer.byteLength;
    var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
    try {
      wasmMemory.grow(pages);
      updateMemoryViews();
      return 1;
    } catch (e) {}
  };
  var _emscripten_resize_heap = (requestedSize) => {
    var oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
      return false;
    }
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
      var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
      overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
      var newSize = Math.min(
        maxHeapSize,
        alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536),
      );
      var replacement = growMemory(newSize);
      if (replacement) {
        return true;
      }
    }
    return false;
  };
  var ENV = {};
  var getExecutableName = () => thisProgram || './this.program';
  var getEnvStrings = () => {
    if (!getEnvStrings.strings) {
      var lang = (globalThis.navigator?.language ?? 'C').replace('-', '_') + '.UTF-8';
      var env = {
        USER: 'web_user',
        LOGNAME: 'web_user',
        PATH: '/',
        PWD: '/',
        HOME: '/home/web_user',
        LANG: lang,
        _: getExecutableName(),
      };
      for (var x in ENV) {
        if (ENV[x] === undefined) delete env[x];
        else env[x] = ENV[x];
      }
      var strings = [];
      for (var x in env) {
        strings.push(`${x}=${env[x]}`);
      }
      getEnvStrings.strings = strings;
    }
    return getEnvStrings.strings;
  };
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
      var u = str.codePointAt(i);
      if (u <= 127) {
        if (outIdx >= endIdx) break;
        heap[outIdx++] = u;
      } else if (u <= 2047) {
        if (outIdx + 1 >= endIdx) break;
        heap[outIdx++] = 192 | (u >> 6);
        heap[outIdx++] = 128 | (u & 63);
      } else if (u <= 65535) {
        if (outIdx + 2 >= endIdx) break;
        heap[outIdx++] = 224 | (u >> 12);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
      } else {
        if (outIdx + 3 >= endIdx) break;
        heap[outIdx++] = 240 | (u >> 18);
        heap[outIdx++] = 128 | ((u >> 12) & 63);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
        i++;
      }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
  };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) =>
    stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
  var _environ_get = (__environ, environ_buf) => {
    var bufSize = 0;
    var envp = 0;
    for (var string of getEnvStrings()) {
      var ptr = environ_buf + bufSize;
      HEAPU32[(__environ + envp) >> 2] = ptr;
      bufSize += stringToUTF8(string, ptr, Infinity) + 1;
      envp += 4;
    }
    return 0;
  };
  var lengthBytesUTF8 = (str) => {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
      var c = str.charCodeAt(i);
      if (c <= 127) {
        len++;
      } else if (c <= 2047) {
        len += 2;
      } else if (c >= 55296 && c <= 57343) {
        len += 4;
        ++i;
      } else {
        len += 3;
      }
    }
    return len;
  };
  var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
    var strings = getEnvStrings();
    HEAPU32[penviron_count >> 2] = strings.length;
    var bufSize = 0;
    for (var string of strings) {
      bufSize += lengthBytesUTF8(string) + 1;
    }
    HEAPU32[penviron_buf_size >> 2] = bufSize;
    return 0;
  };
  var runAndAbortIfError = (func) => {
    try {
      return func();
    } catch (e) {
      abort(e);
    }
  };
  var handleException = (e) => {
    if (e instanceof ExitStatus || e == 'unwind') {
      return EXITSTATUS;
    }
    checkStackCookie();
    if (e instanceof WebAssembly.RuntimeError) {
      if (_emscripten_stack_get_current() <= 0) {
        err(
          'Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 5242880)',
        );
      }
    }
    quit_(1, e);
  };
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  var _proc_exit = (code) => {
    EXITSTATUS = code;
    if (!keepRuntimeAlive()) {
      Module['onExit']?.(code);
      ABORT = true;
    }
    quit_(code, new ExitStatus(code));
  };
  var exitJS = (status, implicit) => {
    EXITSTATUS = status;
    _proc_exit(status);
  };
  var _exit = exitJS;
  var maybeExit = () => {
    if (!keepRuntimeAlive()) {
      try {
        _exit(EXITSTATUS);
      } catch (e) {
        handleException(e);
      }
    }
  };
  var callUserCallback = (func) => {
    if (ABORT) {
      return;
    }
    try {
      return func();
    } catch (e) {
      handleException(e);
    } finally {
      maybeExit();
    }
  };
  var Asyncify = {
    instrumentWasmImports(imports) {
      var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
      for (let [x, original] of Object.entries(imports)) {
        if (typeof original == 'function') {
          let isAsyncifyImport = original.isAsync || importPattern.test(x);
        }
      }
    },
    instrumentFunction(original) {
      var wrapper = (...args) => {
        Asyncify.exportCallStack.push(original);
        try {
          return original(...args);
        } finally {
          if (!ABORT) {
            var top = Asyncify.exportCallStack.pop();
            Asyncify.maybeStopUnwind();
          }
        }
      };
      Asyncify.funcWrappers.set(original, wrapper);
      return wrapper;
    },
    instrumentWasmExports(exports) {
      var ret = {};
      for (let [x, original] of Object.entries(exports)) {
        if (typeof original == 'function') {
          var wrapper = Asyncify.instrumentFunction(original);
          ret[x] = wrapper;
        } else {
          ret[x] = original;
        }
      }
      return ret;
    },
    State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 },
    state: 0,
    StackSize: 16384,
    currData: null,
    handleSleepReturnValue: 0,
    exportCallStack: [],
    callstackFuncToId: new Map(),
    callStackIdToFunc: new Map(),
    funcWrappers: new Map(),
    callStackId: 0,
    asyncPromiseHandlers: null,
    sleepCallbacks: [],
    getCallStackId(func) {
      if (!Asyncify.callstackFuncToId.has(func)) {
        var id = Asyncify.callStackId++;
        Asyncify.callstackFuncToId.set(func, id);
        Asyncify.callStackIdToFunc.set(id, func);
      }
      return Asyncify.callstackFuncToId.get(func);
    },
    maybeStopUnwind() {
      if (
        Asyncify.currData &&
        Asyncify.state === Asyncify.State.Unwinding &&
        Asyncify.exportCallStack.length === 0
      ) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(_asyncify_stop_unwind);
        if (typeof Fibers != 'undefined') {
          Fibers.trampoline();
        }
      }
    },
    whenDone() {
      return new Promise((resolve, reject) => {
        Asyncify.asyncPromiseHandlers = { resolve, reject };
      });
    },
    allocateData() {
      var ptr = _malloc(12 + Asyncify.StackSize);
      Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
      Asyncify.setDataRewindFunc(ptr);
      return ptr;
    },
    setDataHeader(ptr, stack, stackSize) {
      HEAPU32[ptr >> 2] = stack;
      HEAPU32[(ptr + 4) >> 2] = stack + stackSize;
    },
    setDataRewindFunc(ptr) {
      var bottomOfCallStack = Asyncify.exportCallStack[0];
      var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
      HEAP32[(ptr + 8) >> 2] = rewindId;
    },
    getDataRewindFunc(ptr) {
      var id = HEAP32[(ptr + 8) >> 2];
      var func = Asyncify.callStackIdToFunc.get(id);
      return func;
    },
    doRewind(ptr) {
      var original = Asyncify.getDataRewindFunc(ptr);
      var func = Asyncify.funcWrappers.get(original);
      return callUserCallback(func);
    },
    handleSleep(startAsync) {
      if (ABORT) return;
      if (Asyncify.state === Asyncify.State.Normal) {
        var reachedCallback = false;
        var reachedAfterCallback = false;
        startAsync((handleSleepReturnValue = 0) => {
          if (ABORT) return;
          Asyncify.handleSleepReturnValue = handleSleepReturnValue;
          reachedCallback = true;
          if (!reachedAfterCallback) {
            return;
          }
          Asyncify.state = Asyncify.State.Rewinding;
          runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
          if (typeof MainLoop != 'undefined' && MainLoop.func) {
            MainLoop.resume();
          }
          var asyncWasmReturnValue,
            isError = false;
          try {
            asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
          } catch (err) {
            asyncWasmReturnValue = err;
            isError = true;
          }
          var handled = false;
          if (!Asyncify.currData) {
            var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
            if (asyncPromiseHandlers) {
              Asyncify.asyncPromiseHandlers = null;
              (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(
                asyncWasmReturnValue,
              );
              handled = true;
            }
          }
          if (isError && !handled) {
            throw asyncWasmReturnValue;
          }
        });
        reachedAfterCallback = true;
        if (!reachedCallback) {
          Asyncify.state = Asyncify.State.Unwinding;
          Asyncify.currData = Asyncify.allocateData();
          if (typeof MainLoop != 'undefined' && MainLoop.func) {
            MainLoop.pause();
          }
          runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
        }
      } else if (Asyncify.state === Asyncify.State.Rewinding) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(_asyncify_stop_rewind);
        _free(Asyncify.currData);
        Asyncify.currData = null;
        Asyncify.sleepCallbacks.forEach(callUserCallback);
      } else {
        abort(`invalid state: ${Asyncify.state}`);
      }
      return Asyncify.handleSleepReturnValue;
    },
    handleAsync: (startAsync) =>
      Asyncify.handleSleep(async (wakeUp) => {
        wakeUp(await startAsync());
      }),
  };
  var wasmTableMirror = [];
  var getWasmTableEntry = (funcPtr) => {
    var func = wasmTableMirror[funcPtr];
    if (!func) {
      wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
    }
    return func;
  };
  var updateTableMap = (offset, count) => {
    if (functionsInTableMap) {
      for (var i = offset; i < offset + count; i++) {
        var item = getWasmTableEntry(i);
        if (item) {
          functionsInTableMap.set(item, i);
        }
      }
    }
  };
  var functionsInTableMap;
  var getFunctionAddress = (func) => {
    if (!functionsInTableMap) {
      functionsInTableMap = new WeakMap();
      updateTableMap(0, wasmTable.length);
    }
    return functionsInTableMap.get(func) || 0;
  };
  var freeTableIndexes = [];
  var getEmptyTableSlot = () => {
    if (freeTableIndexes.length) {
      return freeTableIndexes.pop();
    }
    return wasmTable['grow'](1);
  };
  var setWasmTableEntry = (idx, func) => {
    wasmTable.set(idx, func);
    wasmTableMirror[idx] = wasmTable.get(idx);
  };
  var uleb128EncodeWithLen = (arr) => {
    const n = arr.length;
    return [(n % 128) | 128, n >> 7, ...arr];
  };
  var wasmTypeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
  var generateTypePack = (types) =>
    uleb128EncodeWithLen(
      Array.from(types, (type) => {
        var code = wasmTypeCodes[type];
        return code;
      }),
    );
  var convertJsFunctionToWasm = (func, sig) => {
    var bytes = Uint8Array.of(
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      ...uleb128EncodeWithLen([
        1,
        96,
        ...generateTypePack(sig.slice(1)),
        ...generateTypePack(sig[0] === 'v' ? '' : sig[0]),
      ]),
      2,
      7,
      1,
      1,
      101,
      1,
      102,
      0,
      0,
      7,
      5,
      1,
      1,
      102,
      0,
      0,
    );
    var module = new WebAssembly.Module(bytes);
    var instance = new WebAssembly.Instance(module, { e: { f: func } });
    var wrappedFunc = instance.exports['f'];
    return wrappedFunc;
  };
  var addFunction = (func, sig) => {
    var rtn = getFunctionAddress(func);
    if (rtn) {
      return rtn;
    }
    var ret = getEmptyTableSlot();
    try {
      setWasmTableEntry(ret, func);
    } catch (err) {
      if (!(err instanceof TypeError)) {
        throw err;
      }
      var wrapped = convertJsFunctionToWasm(func, sig);
      setWasmTableEntry(ret, wrapped);
    }
    functionsInTableMap.set(func, ret);
    return ret;
  };
  {
    if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
    if (Module['print']) out = Module['print'];
    if (Module['printErr']) err = Module['printErr'];
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    if (Module['arguments']) arguments_ = Module['arguments'];
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].shift()();
      }
    }
  }
  Module['addFunction'] = addFunction;
  Module['Asyncify'] = Asyncify;
  var ___asan_default_options,
    _init,
    _dispose,
    _getVersion,
    _setErrorCallback,
    _getMainDesc,
    _getWindowsChangedState,
    _getVarsDesc,
    _getActions,
    _malloc,
    _selectAction,
    _executeSelAction,
    _getObjects,
    _selectObject,
    _loadGameData,
    _restartGame,
    _saveGameData,
    _free,
    _loadSavedGameData,
    _execString,
    _execCounter,
    _execLoc,
    _execUserInput,
    _getLastError,
    _getVarValue,
    _getVarValueByIndex,
    _getVarValueByKey,
    _getVarSize,
    _setCallback,
    _freeItemsList,
    _freeObjectsList,
    _freeSaveBuffer,
    _freeStringsBuffer,
    _enableDebugMode,
    _disableDebugMode,
    _getCurStateData,
    _getLocationsList,
    _getLocationActions,
    _getLocationCode,
    _getActionCode,
    _calculateStrExpression,
    _calculateNumExpression,
    _showWindow,
    _getSelActionIndex,
    _getSelObjectIndex,
    _getCompiledDateTime,
    _getErrorDesc,
    _getLocationDesc,
    __run_checks,
    _emscripten_stack_get_end,
    _emscripten_stack_get_base,
    _emscripten_stack_init,
    _emscripten_stack_get_current,
    ___set_stack_limits,
    dynCall_iii,
    dynCall_viii,
    dynCall_vi,
    dynCall_iiii,
    dynCall_iiiii,
    dynCall_ii,
    dynCall_i,
    dynCall_iidiiii,
    dynCall_vii,
    _asyncify_start_unwind,
    _asyncify_stop_unwind,
    _asyncify_start_rewind,
    _asyncify_stop_rewind,
    memory,
    __indirect_function_table,
    wasmMemory,
    wasmTable;
  function assignWasmExports(wasmExports) {
    ___asan_default_options = Module['___asan_default_options'] = wasmExports['h'];
    _init = Module['_init'] = wasmExports['i'];
    _dispose = Module['_dispose'] = wasmExports['j'];
    _getVersion = Module['_getVersion'] = wasmExports['k'];
    _setErrorCallback = Module['_setErrorCallback'] = wasmExports['l'];
    _getMainDesc = Module['_getMainDesc'] = wasmExports['n'];
    _getWindowsChangedState = Module['_getWindowsChangedState'] = wasmExports['o'];
    _getVarsDesc = Module['_getVarsDesc'] = wasmExports['p'];
    _getActions = Module['_getActions'] = wasmExports['q'];
    _malloc = Module['_malloc'] = wasmExports['r'];
    _selectAction = Module['_selectAction'] = wasmExports['s'];
    _executeSelAction = Module['_executeSelAction'] = wasmExports['t'];
    _getObjects = Module['_getObjects'] = wasmExports['u'];
    _selectObject = Module['_selectObject'] = wasmExports['v'];
    _loadGameData = Module['_loadGameData'] = wasmExports['w'];
    _restartGame = Module['_restartGame'] = wasmExports['x'];
    _saveGameData = Module['_saveGameData'] = wasmExports['y'];
    _free = Module['_free'] = wasmExports['z'];
    _loadSavedGameData = Module['_loadSavedGameData'] = wasmExports['A'];
    _execString = Module['_execString'] = wasmExports['B'];
    _execCounter = Module['_execCounter'] = wasmExports['C'];
    _execLoc = Module['_execLoc'] = wasmExports['D'];
    _execUserInput = Module['_execUserInput'] = wasmExports['E'];
    _getLastError = Module['_getLastError'] = wasmExports['F'];
    _getVarValue = Module['_getVarValue'] = wasmExports['G'];
    _getVarValueByIndex = Module['_getVarValueByIndex'] = wasmExports['H'];
    _getVarValueByKey = Module['_getVarValueByKey'] = wasmExports['I'];
    _getVarSize = Module['_getVarSize'] = wasmExports['J'];
    _setCallback = Module['_setCallback'] = wasmExports['K'];
    _freeItemsList = Module['_freeItemsList'] = wasmExports['L'];
    _freeObjectsList = Module['_freeObjectsList'] = wasmExports['M'];
    _freeSaveBuffer = Module['_freeSaveBuffer'] = wasmExports['N'];
    _freeStringsBuffer = Module['_freeStringsBuffer'] = wasmExports['O'];
    _enableDebugMode = Module['_enableDebugMode'] = wasmExports['P'];
    _disableDebugMode = Module['_disableDebugMode'] = wasmExports['Q'];
    _getCurStateData = Module['_getCurStateData'] = wasmExports['R'];
    _getLocationsList = Module['_getLocationsList'] = wasmExports['S'];
    _getLocationActions = Module['_getLocationActions'] = wasmExports['T'];
    _getLocationCode = Module['_getLocationCode'] = wasmExports['U'];
    _getActionCode = Module['_getActionCode'] = wasmExports['V'];
    _calculateStrExpression = Module['_calculateStrExpression'] = wasmExports['W'];
    _calculateNumExpression = Module['_calculateNumExpression'] = wasmExports['X'];
    _showWindow = Module['_showWindow'] = wasmExports['Y'];
    _getSelActionIndex = Module['_getSelActionIndex'] = wasmExports['Z'];
    _getSelObjectIndex = Module['_getSelObjectIndex'] = wasmExports['_'];
    _getCompiledDateTime = Module['_getCompiledDateTime'] = wasmExports['$'];
    _getErrorDesc = Module['_getErrorDesc'] = wasmExports['aa'];
    _getLocationDesc = Module['_getLocationDesc'] = wasmExports['ba'];
    __run_checks = Module['__run_checks'] = wasmExports['ca'];
    _emscripten_stack_get_end = wasmExports['da'];
    _emscripten_stack_get_base = wasmExports['ea'];
    _emscripten_stack_init = wasmExports['fa'];
    _emscripten_stack_get_current = wasmExports['ga'];
    ___set_stack_limits = Module['___set_stack_limits'] = wasmExports['ha'];
    dynCall_iii = dynCalls['iii'] = wasmExports['ia'];
    dynCall_viii = dynCalls['viii'] = wasmExports['ja'];
    dynCall_vi = dynCalls['vi'] = wasmExports['ka'];
    dynCall_iiii = dynCalls['iiii'] = wasmExports['la'];
    dynCall_iiiii = dynCalls['iiiii'] = wasmExports['ma'];
    dynCall_ii = dynCalls['ii'] = wasmExports['na'];
    dynCall_i = dynCalls['i'] = wasmExports['oa'];
    dynCall_iidiiii = dynCalls['iidiiii'] = wasmExports['pa'];
    dynCall_vii = dynCalls['vii'] = wasmExports['qa'];
    _asyncify_start_unwind = wasmExports['ra'];
    _asyncify_stop_unwind = wasmExports['sa'];
    _asyncify_start_rewind = wasmExports['ta'];
    _asyncify_stop_rewind = wasmExports['ua'];
    memory = wasmMemory = wasmExports['f'];
    __indirect_function_table = wasmTable = wasmExports['m'];
  }
  var wasmImports = {
    a: ___handle_stack_overflow,
    e: _emscripten_date_now,
    b: _emscripten_resize_heap,
    c: _environ_get,
    d: _environ_sizes_get,
  };
  function stackCheckInit() {
    _emscripten_stack_init();
    writeStackCookie();
  }
  function run() {
    stackCheckInit();
    preRun();
    function doRun() {
      Module['calledRun'] = true;
      if (ABORT) return;
      initRuntime();
      readyPromiseResolve?.(Module);
      Module['onRuntimeInitialized']?.();
      postRun();
    }
    if (Module['setStatus']) {
      Module['setStatus']('Running...');
      setTimeout(() => {
        setTimeout(() => Module['setStatus'](''), 1);
        doRun();
      }, 1);
    } else {
      doRun();
    }
    checkStackCookie();
  }
  var wasmExports;
  wasmExports = await createWasm();
  run();
  if (runtimeInitialized) {
    moduleRtn = Module;
  } else {
    moduleRtn = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
  }
  return moduleRtn;
}
export default createQspModule;
