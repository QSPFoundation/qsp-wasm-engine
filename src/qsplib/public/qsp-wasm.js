var createQspModule = function (createQspModule) {
  createQspModule = createQspModule || {};

  var Module = createQspModule;
  var readyPromiseResolve, readyPromiseReject;
  Module['ready'] = new Promise((resolve, reject) => {
    readyPromiseResolve = resolve;
    readyPromiseReject = reject;
  });
  function err(text) {
    console.error(text);
  }
  function ready() {
    readyPromiseResolve(Module);
  }
  function abort(what) {
    throw what;
  }
  function uleb128Encode(n) {
    if (n < 128) {
      return [n];
    }
    return [n % 128 | 128, n >> 7];
  }
  function sigToWasmTypes(sig) {
    var typeNames = { i: 'i32', j: 'i64', f: 'f32', d: 'f64', p: 'i32' };
    var type = { parameters: [], results: sig[0] == 'v' ? [] : [typeNames[sig[0]]] };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return type;
  }
  function convertJsFunctionToWasm(func, sig) {
    if (typeof WebAssembly.Function == 'function') {
      return new WebAssembly.Function(sigToWasmTypes(sig), func);
    }
    var typeSection = [1, 96];
    var sigRet = sig.slice(0, 1);
    var sigParam = sig.slice(1);
    var typeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124 };
    typeSection = typeSection.concat(uleb128Encode(sigParam.length));
    for (var i = 0; i < sigParam.length; ++i) {
      typeSection.push(typeCodes[sigParam[i]]);
    }
    if (sigRet == 'v') {
      typeSection.push(0);
    } else {
      typeSection = typeSection.concat([1, typeCodes[sigRet]]);
    }
    typeSection = [1].concat(uleb128Encode(typeSection.length), typeSection);
    var bytes = new Uint8Array(
      [0, 97, 115, 109, 1, 0, 0, 0].concat(
        typeSection,
        [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]
      )
    );
    var module = new WebAssembly.Module(bytes);
    var instance = new WebAssembly.Instance(module, { e: { f: func } });
    var wrappedFunc = instance.exports['f'];
    return wrappedFunc;
  }
  var freeTableIndexes = [];
  var functionsInTableMap;
  function getEmptyTableSlot() {
    if (freeTableIndexes.length) {
      return freeTableIndexes.pop();
    }
    try {
      wasmTable.grow(1);
    } catch (err) {
      if (!(err instanceof RangeError)) {
        throw err;
      }
      throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
    }
    return wasmTable.length - 1;
  }
  function updateTableMap(offset, count) {
    for (var i = offset; i < offset + count; i++) {
      var item = getWasmTableEntry(i);
      if (item) {
        functionsInTableMap.set(item, i);
      }
    }
  }
  function addFunction(func, sig) {
    if (!functionsInTableMap) {
      functionsInTableMap = new WeakMap();
      updateTableMap(0, wasmTable.length);
    }
    if (functionsInTableMap.has(func)) {
      return functionsInTableMap.get(func);
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
  }
  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
      return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
    } else {
      var str = '';
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode(((u0 & 31) << 6) | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        }
      }
    }
    return str;
  }
  function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
  }
  var HEAP8,
    HEAP16,
    HEAP32,
    HEAPU8,
    HEAPU16,
    HEAPU32,
    HEAPF32,
    HEAPF64,
    wasmMemory,
    buffer,
    wasmTable;
  function updateGlobalBufferAndViews(b) {
    buffer = b;
    HEAP8 = new Int8Array(b);
    HEAP16 = new Int16Array(b);
    HEAP32 = new Int32Array(b);
    HEAPU8 = new Uint8Array(b);
    HEAPU16 = new Uint16Array(b);
    HEAPU32 = new Uint32Array(b);
    HEAPF32 = new Float32Array(b);
    HEAPF64 = new Float64Array(b);
  }
  function writeStackCookie() {
    var max = _emscripten_stack_get_end();
    HEAP32[max >> 2] = 34821223;
    HEAP32[(max + 4) >> 2] = 2310721022;
    HEAPU32[0] = 1668509029;
  }
  function checkStackCookie() {
    var max = _emscripten_stack_get_end();
    var cookie1 = HEAPU32[max >> 2];
    var cookie2 = HEAPU32[(max + 4) >> 2];
    if (cookie1 != 34821223 || cookie2 != 2310721022) {
      abort(
        'Stack overflow! Stack cookie has been overwritten at 0x' +
          max.toString(16) +
          ', expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' +
          cookie2.toString(16) +
          ' 0x' +
          cookie1.toString(16)
      );
    }
    if (HEAPU32[0] !== 1668509029)
      abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
  var wasmTableMirror = [];
  function getWasmTableEntry(funcPtr) {
    var func = wasmTableMirror[funcPtr];
    if (!func) {
      if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
      wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
    }
    return func;
  }
  function setWasmTableEntry(idx, func) {
    wasmTable.set(idx, func);
    wasmTableMirror[idx] = wasmTable.get(idx);
  }
  function ___handle_stack_overflow(requested) {
    requested = requested >>> 0;
    abort(
      'stack overflow (Attempt to set SP to 0x' +
        requested.toString(16) +
        ', with stack limits [0x' +
        _emscripten_stack_get_end().toString(16) +
        ' - 0x' +
        _emscripten_stack_get_base().toString(16) +
        '])'
    );
  }
  function __emscripten_date_now() {
    return Date.now();
  }
  function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.copyWithin(dest, src, src + num);
  }
  function getHeapMax() {
    return 2147483648;
  }
  function emscripten_realloc_buffer(size) {
    try {
      wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
      updateGlobalBufferAndViews(wasmMemory.buffer);
      return 1;
    } catch (e) {}
  }
  function _emscripten_resize_heap(requestedSize) {
    var oldSize = HEAPU8.length;
    requestedSize = requestedSize >>> 0;
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
      return false;
    }
    let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
      var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
      overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
      var newSize = Math.min(
        maxHeapSize,
        alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
      );
      var replacement = emscripten_realloc_buffer(newSize);
      if (replacement) {
        return true;
      }
    }
    return false;
  }
  var ENV = {};
  function getExecutableName() {
    return './this.program';
  }
  function getEnvStrings() {
    if (!getEnvStrings.strings) {
      var lang =
        (
          (typeof navigator == 'object' && navigator.languages && navigator.languages[0]) ||
          'C'
        ).replace('-', '_') + '.UTF-8';
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
        strings.push(x + '=' + env[x]);
      }
      getEnvStrings.strings = strings;
    }
    return getEnvStrings.strings;
  }
  function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
      HEAP8[buffer++ >> 0] = str.charCodeAt(i);
    }
    if (!dontAddNull) HEAP8[buffer >> 0] = 0;
  }
  var SYSCALLS = {
    varargs: undefined,
    get: function () {
      SYSCALLS.varargs += 4;
      var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
      return ret;
    },
    getStr: function (ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    },
  };
  function _environ_get(__environ, environ_buf) {
    var bufSize = 0;
    getEnvStrings().forEach(function (string, i) {
      var ptr = environ_buf + bufSize;
      HEAPU32[(__environ + i * 4) >> 2] = ptr;
      writeAsciiToMemory(string, ptr);
      bufSize += string.length + 1;
    });
    return 0;
  }
  function _environ_sizes_get(penviron_count, penviron_buf_size) {
    var strings = getEnvStrings();
    HEAPU32[penviron_count >> 2] = strings.length;
    var bufSize = 0;
    strings.forEach(function (string) {
      bufSize += string.length + 1;
    });
    HEAPU32[penviron_buf_size >> 2] = bufSize;
    return 0;
  }
  function runAndAbortIfError(func) {
    try {
      return func();
    } catch (e) {
      abort(e);
    }
  }
  function callUserCallback(func) {
    func();
  }
  var Asyncify = {
    State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 },
    state: 0,
    StackSize: 4096,
    currData: null,
    handleSleepReturnValue: 0,
    exportCallStack: [],
    callStackNameToId: {},
    callStackIdToName: {},
    callStackId: 0,
    asyncPromiseHandlers: null,
    sleepCallbacks: [],
    getCallStackId: function (funcName) {
      var id = Asyncify.callStackNameToId[funcName];
      if (id === undefined) {
        id = Asyncify.callStackId++;
        Asyncify.callStackNameToId[funcName] = id;
        Asyncify.callStackIdToName[id] = funcName;
      }
      return id;
    },
    instrumentWasmImports: function (imports) {
      var ASYNCIFY_IMPORTS = [
        'env.invoke_*',
        'env.emscripten_sleep',
        'env.emscripten_wget',
        'env.emscripten_wget_data',
        'env.emscripten_idb_load',
        'env.emscripten_idb_store',
        'env.emscripten_idb_delete',
        'env.emscripten_idb_exists',
        'env.emscripten_idb_load_blob',
        'env.emscripten_idb_store_blob',
        'env.SDL_Delay',
        'env.emscripten_scan_registers',
        'env.emscripten_lazy_load_code',
        'env.emscripten_fiber_swap',
        'wasi_snapshot_preview1.fd_sync',
        'env.__wasi_fd_sync',
        'env._emval_await',
        'env._dlopen_js',
        'env.__asyncjs__*',
      ].map((x) => x.split('.')[1]);
      for (var x in imports) {
        (function (x) {
          var original = imports[x];
          var sig = original.sig;
          if (typeof original == 'function') {
            var isAsyncifyImport = ASYNCIFY_IMPORTS.indexOf(x) >= 0 || x.startsWith('__asyncjs__');
          }
        })(x);
      }
    },
    instrumentWasmExports: function (exports) {
      var ret = {};
      for (var x in exports) {
        (function (x) {
          var original = exports[x];
          if (typeof original == 'function') {
            ret[x] = function () {
              Asyncify.exportCallStack.push(x);
              try {
                return original.apply(null, arguments);
              } finally {
                if (!ABORT) {
                  var y = Asyncify.exportCallStack.pop();
                  assert(y === x);
                  Asyncify.maybeStopUnwind();
                }
              }
            };
          } else {
            ret[x] = original;
          }
        })(x);
      }
      return ret;
    },
    maybeStopUnwind: function () {
      if (
        Asyncify.currData &&
        Asyncify.state === Asyncify.State.Unwinding &&
        Asyncify.exportCallStack.length === 0
      ) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(Module['_asyncify_stop_unwind']);
        if (typeof Fibers != 'undefined') {
          Fibers.trampoline();
        }
      }
    },
    whenDone: function () {
      return new Promise((resolve, reject) => {
        Asyncify.asyncPromiseHandlers = { resolve: resolve, reject: reject };
      });
    },
    allocateData: function () {
      var ptr = _malloc(12 + Asyncify.StackSize);
      Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
      Asyncify.setDataRewindFunc(ptr);
      return ptr;
    },
    setDataHeader: function (ptr, stack, stackSize) {
      HEAP32[ptr >> 2] = stack;
      HEAP32[(ptr + 4) >> 2] = stack + stackSize;
    },
    setDataRewindFunc: function (ptr) {
      var bottomOfCallStack = Asyncify.exportCallStack[0];
      var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
      HEAP32[(ptr + 8) >> 2] = rewindId;
    },
    getDataRewindFunc: function (ptr) {
      var id = HEAP32[(ptr + 8) >> 2];
      var name = Asyncify.callStackIdToName[id];
      var func = Module['asm'][name];
      return func;
    },
    doRewind: function (ptr) {
      var start = Asyncify.getDataRewindFunc(ptr);
      return start();
    },
    handleSleep: function (startAsync) {
      if (ABORT) return;
      if (Asyncify.state === Asyncify.State.Normal) {
        var reachedCallback = false;
        var reachedAfterCallback = false;
        startAsync((handleSleepReturnValue) => {
          if (ABORT) return;
          Asyncify.handleSleepReturnValue = handleSleepReturnValue || 0;
          reachedCallback = true;
          if (!reachedAfterCallback) {
            return;
          }
          Asyncify.state = Asyncify.State.Rewinding;
          runAndAbortIfError(() => Module['_asyncify_start_rewind'](Asyncify.currData));
          if (typeof Browser != 'undefined' && Browser.mainLoop.func) {
            Browser.mainLoop.resume();
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
                asyncWasmReturnValue
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
          if (typeof Browser != 'undefined' && Browser.mainLoop.func) {
            Browser.mainLoop.pause();
          }
          runAndAbortIfError(() => Module['_asyncify_start_unwind'](Asyncify.currData));
        }
      } else if (Asyncify.state === Asyncify.State.Rewinding) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(Module['_asyncify_stop_rewind']);
        _free(Asyncify.currData);
        Asyncify.currData = null;
        Asyncify.sleepCallbacks.forEach((func) => callUserCallback(func));
      } else {
        abort('invalid state: ' + Asyncify.state);
      }
      return Asyncify.handleSleepReturnValue;
    },
    handleAsync: function (startAsync) {
      return Asyncify.handleSleep((wakeUp) => {
        startAsync().then(wakeUp);
      });
    },
  };
  var asmLibraryArg = {
    a: ___handle_stack_overflow,
    e: __emscripten_date_now,
    f: _emscripten_memcpy_big,
    b: _emscripten_resize_heap,
    c: _environ_get,
    d: _environ_sizes_get,
  };
  Module['addFunction'] = addFunction;
  Module['writeStackCookie'] = writeStackCookie;
  Module['checkStackCookie'] = checkStackCookie;
  Module['getValue'] = getValue;
  Module['UTF32ToString'] = UTF32ToString;
  Module['stringToUTF32'] = stringToUTF32;
  Module['lengthBytesUTF32'] = lengthBytesUTF32;
  Module['Asyncify'] = Asyncify;
  function initRuntime(asm) {
    _emscripten_stack_init();
    writeStackCookie();
    ___set_stack_limits(_emscripten_stack_get_base(), _emscripten_stack_get_end());
    asm['h']();
  }
  var imports = { a: asmLibraryArg };
  var _init,
    _dispose,
    _getVersion,
    _setErrorCallback,
    _getMainDesc,
    _isMainDescChanged,
    _getVarsDesc,
    _isVarsDescChanged,
    _getActions,
    _malloc,
    _selectAction,
    _executeSelAction,
    _isActionsChanged,
    _getObjects,
    _selectObject,
    _isObjectsChanged,
    _loadGameData,
    _restartGame,
    _saveGameData,
    _free,
    _loadSavedGameData,
    _execString,
    _execCounter,
    _execLoc,
    _execUserInput,
    _getLastErrorNum,
    _getLastErrorLoc,
    _getLastErrorActIndex,
    _getLastErrorLine,
    _getErrorDesc,
    _getVarStringValue,
    _getVarNumValue,
    _initCallBacks,
    _setCallBack,
    _freeItemsList,
    _freeSaveBuffer,
    _setThrew,
    _saveSetjmp,
    _emscripten_stack_init,
    _emscripten_stack_set_limits,
    _emscripten_stack_get_free,
    _emscripten_stack_get_base,
    _emscripten_stack_get_end,
    ___set_stack_limits,
    _asyncify_start_unwind,
    _asyncify_stop_unwind,
    _asyncify_start_rewind,
    _asyncify_stop_rewind;
  WebAssembly.instantiate(Module['wasm'], imports).then(function (output) {
    var asm = output.instance.exports;
    _init = asm['i'];
    _dispose = asm['j'];
    _getVersion = asm['k'];
    _setErrorCallback = asm['l'];
    _getMainDesc = asm['m'];
    _isMainDescChanged = asm['n'];
    _getVarsDesc = asm['o'];
    _isVarsDescChanged = asm['p'];
    _getActions = asm['q'];
    _malloc = asm['r'];
    _selectAction = asm['s'];
    _executeSelAction = asm['t'];
    _isActionsChanged = asm['u'];
    _getObjects = asm['v'];
    _selectObject = asm['w'];
    _isObjectsChanged = asm['x'];
    _loadGameData = asm['y'];
    _restartGame = asm['z'];
    _saveGameData = asm['A'];
    _free = asm['B'];
    _loadSavedGameData = asm['C'];
    _execString = asm['D'];
    _execCounter = asm['E'];
    _execLoc = asm['F'];
    _execUserInput = asm['G'];
    _getLastErrorNum = asm['H'];
    _getLastErrorLoc = asm['I'];
    _getLastErrorActIndex = asm['J'];
    _getLastErrorLine = asm['K'];
    _getErrorDesc = asm['L'];
    _getVarStringValue = asm['M'];
    _getVarNumValue = asm['N'];
    _initCallBacks = asm['O'];
    _setCallBack = asm['P'];
    _freeItemsList = asm['Q'];
    _freeSaveBuffer = asm['R'];
    _setThrew = asm['setThrew'];
    _saveSetjmp = asm['saveSetjmp'];
    _emscripten_stack_init = asm['T'];
    _emscripten_stack_set_limits = asm['emscripten_stack_set_limits'];
    _emscripten_stack_get_free = asm['emscripten_stack_get_free'];
    _emscripten_stack_get_base = asm['U'];
    _emscripten_stack_get_end = asm['V'];
    ___set_stack_limits = asm['W'];
    _asyncify_start_unwind = asm['X'];
    _asyncify_stop_unwind = asm['Y'];
    _asyncify_start_rewind = asm['Z'];
    _asyncify_stop_rewind = asm['_'];
    wasmTable = asm['S'];
    wasmMemory = asm['g'];
    updateGlobalBufferAndViews(wasmMemory.buffer);
    initRuntime(asm);
    ready();
  });

  return createQspModule.ready;
};
export default createQspModule;
