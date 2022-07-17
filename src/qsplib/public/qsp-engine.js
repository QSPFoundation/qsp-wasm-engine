var createQspModule = (() => {
  var _scriptDir = import.meta.url;

  return function (createQspModule) {
    createQspModule = createQspModule || {};

    var Module = typeof createQspModule != 'undefined' ? createQspModule : {};
    var readyPromiseResolve, readyPromiseReject;
    Module['ready'] = new Promise(function (resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var moduleOverrides = Object.assign({}, Module);
    var arguments_ = [];
    var thisProgram = './this.program';
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var ENVIRONMENT_IS_WEB = typeof window == 'object';
    var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
    var ENVIRONMENT_IS_NODE =
      typeof process == 'object' &&
      typeof process.versions == 'object' &&
      typeof process.versions.node == 'string';
    var scriptDirectory = '';
    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != 'undefined' && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf('blob:') !== 0) {
        scriptDirectory = scriptDirectory.substr(
          0,
          scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
        );
      } else {
        scriptDirectory = '';
      }
      {
        read_ = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.responseType = 'arraybuffer';
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = (url, onload, onerror) => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'arraybuffer';
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
      setWindowTitle = (title) => (document.title = title);
    } else {
    }
    var out = Module['print'] || console.log.bind(console);
    var err = Module['printErr'] || console.warn.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module['arguments']) arguments_ = Module['arguments'];
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    if (Module['quit']) quit_ = Module['quit'];
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
    var wasmBinary;
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    var noExitRuntime = Module['noExitRuntime'] || true;
    if (typeof WebAssembly != 'object') {
      abort('no native wasm support detected');
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
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
    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
      }
      if (!dontAddNull) HEAP8[buffer >> 0] = 0;
    }
    var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module['HEAP8'] = HEAP8 = new Int8Array(buf);
      Module['HEAP16'] = HEAP16 = new Int16Array(buf);
      Module['HEAP32'] = HEAP32 = new Int32Array(buf);
      Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
      Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
      Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
      Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
      Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
    }
    var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
    var wasmTable;
    function writeStackCookie() {
      var max = _emscripten_stack_get_end();
      HEAP32[max >> 2] = 34821223;
      HEAP32[(max + 4) >> 2] = 2310721022;
      HEAPU32[0] = 1668509029;
    }
    function checkStackCookie() {
      if (ABORT) return;
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
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function preRun() {
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      checkStackCookie();
      ___set_stack_limits(_emscripten_stack_get_base(), _emscripten_stack_get_end());
      callRuntimeCallbacks(__ATINIT__);
    }
    function postRun() {
      checkStackCookie();
      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function addRunDependency(id) {
      runDependencies++;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      {
        if (Module['onAbort']) {
          Module['onAbort'](what);
        }
      }
      what = 'Aborted(' + what + ')';
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what += '. Build with -sASSERTIONS for more info.';
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = 'data:application/octet-stream;base64,';
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    function isFileURI(filename) {
      return filename.startsWith('file://');
    }
    var wasmBinaryFile;
    if (Module['locateFile']) {
      wasmBinaryFile = 'qsp-engine.wasm';
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }
    } else {
      wasmBinaryFile = new URL('qsp-engine.wasm', import.meta.url).toString();
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        } else {
          throw 'both async and sync fetching of the wasm failed';
        }
      } catch (err) {
        abort(err);
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == 'function' && !isFileURI(wasmBinaryFile)) {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' })
            .then(function (response) {
              if (!response['ok']) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
              }
              return response['arrayBuffer']();
            })
            .catch(function () {
              return getBinary(wasmBinaryFile);
            });
        } else {
          if (readAsync) {
            return new Promise(function (resolve, reject) {
              readAsync(
                wasmBinaryFile,
                function (response) {
                  resolve(new Uint8Array(response));
                },
                reject
              );
            });
          }
        }
      }
      return Promise.resolve().then(function () {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = { a: asmLibraryArg };
      function receiveInstance(instance, module) {
        var exports = instance.exports;
        exports = Asyncify.instrumentWasmExports(exports);
        Module['asm'] = exports;
        wasmMemory = Module['asm']['g'];
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module['asm']['S'];
        addOnInit(Module['asm']['h']);
        removeRunDependency('wasm-instantiate');
      }
      addRunDependency('wasm-instantiate');
      function receiveInstantiationResult(result) {
        receiveInstance(result['instance']);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
          .then(function (binary) {
            return WebAssembly.instantiate(binary, info);
          })
          .then(function (instance) {
            return instance;
          })
          .then(receiver, function (reason) {
            err('failed to asynchronously prepare wasm: ' + reason);
            abort(reason);
          });
      }
      function instantiateAsync() {
        if (
          !wasmBinary &&
          typeof WebAssembly.instantiateStreaming == 'function' &&
          !isDataURI(wasmBinaryFile) &&
          !isFileURI(wasmBinaryFile) &&
          typeof fetch == 'function'
        ) {
          return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
            var result = WebAssembly.instantiateStreaming(response, info);
            return result.then(receiveInstantiationResult, function (reason) {
              err('wasm streaming compile failed: ' + reason);
              err('falling back to ArrayBuffer instantiation');
              return instantiateArrayBuffer(receiveInstantiationResult);
            });
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult);
        }
      }
      if (Module['instantiateWasm']) {
        try {
          var exports = Module['instantiateWasm'](info, receiveInstance);
          exports = Asyncify.instrumentWasmExports(exports);
          return exports;
        } catch (e) {
          err('Module.instantiateWasm callback failed with error: ' + e);
          return false;
        }
      }
      instantiateAsync().catch(readyPromiseReject);
      return {};
    }
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
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
    function handleException(e) {
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
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
      return thisProgram || './this.program';
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
    function callUserCallback(func, synchronous) {
      if (ABORT) {
        return;
      }
      if (synchronous) {
        func();
        return;
      }
      try {
        func();
      } catch (e) {
        handleException(e);
      }
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
              var isAsyncifyImport =
                ASYNCIFY_IMPORTS.indexOf(x) >= 0 || x.startsWith('__asyncjs__');
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
    var asm = createWasm();
    var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
      return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['h']).apply(
        null,
        arguments
      );
    });
    var _init = (Module['_init'] = function () {
      return (_init = Module['_init'] = Module['asm']['i']).apply(null, arguments);
    });
    var _dispose = (Module['_dispose'] = function () {
      return (_dispose = Module['_dispose'] = Module['asm']['j']).apply(null, arguments);
    });
    var _getVersion = (Module['_getVersion'] = function () {
      return (_getVersion = Module['_getVersion'] = Module['asm']['k']).apply(null, arguments);
    });
    var _setErrorCallback = (Module['_setErrorCallback'] = function () {
      return (_setErrorCallback = Module['_setErrorCallback'] = Module['asm']['l']).apply(
        null,
        arguments
      );
    });
    var _getMainDesc = (Module['_getMainDesc'] = function () {
      return (_getMainDesc = Module['_getMainDesc'] = Module['asm']['m']).apply(null, arguments);
    });
    var _isMainDescChanged = (Module['_isMainDescChanged'] = function () {
      return (_isMainDescChanged = Module['_isMainDescChanged'] = Module['asm']['n']).apply(
        null,
        arguments
      );
    });
    var _getVarsDesc = (Module['_getVarsDesc'] = function () {
      return (_getVarsDesc = Module['_getVarsDesc'] = Module['asm']['o']).apply(null, arguments);
    });
    var _isVarsDescChanged = (Module['_isVarsDescChanged'] = function () {
      return (_isVarsDescChanged = Module['_isVarsDescChanged'] = Module['asm']['p']).apply(
        null,
        arguments
      );
    });
    var _getActions = (Module['_getActions'] = function () {
      return (_getActions = Module['_getActions'] = Module['asm']['q']).apply(null, arguments);
    });
    var _malloc = (Module['_malloc'] = function () {
      return (_malloc = Module['_malloc'] = Module['asm']['r']).apply(null, arguments);
    });
    var _selectAction = (Module['_selectAction'] = function () {
      return (_selectAction = Module['_selectAction'] = Module['asm']['s']).apply(null, arguments);
    });
    var _executeSelAction = (Module['_executeSelAction'] = function () {
      return (_executeSelAction = Module['_executeSelAction'] = Module['asm']['t']).apply(
        null,
        arguments
      );
    });
    var _isActionsChanged = (Module['_isActionsChanged'] = function () {
      return (_isActionsChanged = Module['_isActionsChanged'] = Module['asm']['u']).apply(
        null,
        arguments
      );
    });
    var _getObjects = (Module['_getObjects'] = function () {
      return (_getObjects = Module['_getObjects'] = Module['asm']['v']).apply(null, arguments);
    });
    var _selectObject = (Module['_selectObject'] = function () {
      return (_selectObject = Module['_selectObject'] = Module['asm']['w']).apply(null, arguments);
    });
    var _isObjectsChanged = (Module['_isObjectsChanged'] = function () {
      return (_isObjectsChanged = Module['_isObjectsChanged'] = Module['asm']['x']).apply(
        null,
        arguments
      );
    });
    var _loadGameData = (Module['_loadGameData'] = function () {
      return (_loadGameData = Module['_loadGameData'] = Module['asm']['y']).apply(null, arguments);
    });
    var _restartGame = (Module['_restartGame'] = function () {
      return (_restartGame = Module['_restartGame'] = Module['asm']['z']).apply(null, arguments);
    });
    var _saveGameData = (Module['_saveGameData'] = function () {
      return (_saveGameData = Module['_saveGameData'] = Module['asm']['A']).apply(null, arguments);
    });
    var _free = (Module['_free'] = function () {
      return (_free = Module['_free'] = Module['asm']['B']).apply(null, arguments);
    });
    var _loadSavedGameData = (Module['_loadSavedGameData'] = function () {
      return (_loadSavedGameData = Module['_loadSavedGameData'] = Module['asm']['C']).apply(
        null,
        arguments
      );
    });
    var _execString = (Module['_execString'] = function () {
      return (_execString = Module['_execString'] = Module['asm']['D']).apply(null, arguments);
    });
    var _execCounter = (Module['_execCounter'] = function () {
      return (_execCounter = Module['_execCounter'] = Module['asm']['E']).apply(null, arguments);
    });
    var _execLoc = (Module['_execLoc'] = function () {
      return (_execLoc = Module['_execLoc'] = Module['asm']['F']).apply(null, arguments);
    });
    var _execUserInput = (Module['_execUserInput'] = function () {
      return (_execUserInput = Module['_execUserInput'] = Module['asm']['G']).apply(
        null,
        arguments
      );
    });
    var _getLastErrorNum = (Module['_getLastErrorNum'] = function () {
      return (_getLastErrorNum = Module['_getLastErrorNum'] = Module['asm']['H']).apply(
        null,
        arguments
      );
    });
    var _getLastErrorLoc = (Module['_getLastErrorLoc'] = function () {
      return (_getLastErrorLoc = Module['_getLastErrorLoc'] = Module['asm']['I']).apply(
        null,
        arguments
      );
    });
    var _getLastErrorActIndex = (Module['_getLastErrorActIndex'] = function () {
      return (_getLastErrorActIndex = Module['_getLastErrorActIndex'] = Module['asm']['J']).apply(
        null,
        arguments
      );
    });
    var _getLastErrorLine = (Module['_getLastErrorLine'] = function () {
      return (_getLastErrorLine = Module['_getLastErrorLine'] = Module['asm']['K']).apply(
        null,
        arguments
      );
    });
    var _getErrorDesc = (Module['_getErrorDesc'] = function () {
      return (_getErrorDesc = Module['_getErrorDesc'] = Module['asm']['L']).apply(null, arguments);
    });
    var _getVarStringValue = (Module['_getVarStringValue'] = function () {
      return (_getVarStringValue = Module['_getVarStringValue'] = Module['asm']['M']).apply(
        null,
        arguments
      );
    });
    var _getVarNumValue = (Module['_getVarNumValue'] = function () {
      return (_getVarNumValue = Module['_getVarNumValue'] = Module['asm']['N']).apply(
        null,
        arguments
      );
    });
    var _initCallBacks = (Module['_initCallBacks'] = function () {
      return (_initCallBacks = Module['_initCallBacks'] = Module['asm']['O']).apply(
        null,
        arguments
      );
    });
    var _setCallBack = (Module['_setCallBack'] = function () {
      return (_setCallBack = Module['_setCallBack'] = Module['asm']['P']).apply(null, arguments);
    });
    var _freeItemsList = (Module['_freeItemsList'] = function () {
      return (_freeItemsList = Module['_freeItemsList'] = Module['asm']['Q']).apply(
        null,
        arguments
      );
    });
    var _freeSaveBuffer = (Module['_freeSaveBuffer'] = function () {
      return (_freeSaveBuffer = Module['_freeSaveBuffer'] = Module['asm']['R']).apply(
        null,
        arguments
      );
    });
    var _emscripten_stack_init = (Module['_emscripten_stack_init'] = function () {
      return (_emscripten_stack_init = Module['_emscripten_stack_init'] = Module['asm']['T']).apply(
        null,
        arguments
      );
    });
    var _emscripten_stack_get_base = (Module['_emscripten_stack_get_base'] = function () {
      return (_emscripten_stack_get_base = Module['_emscripten_stack_get_base'] =
        Module['asm']['U']).apply(null, arguments);
    });
    var _emscripten_stack_get_end = (Module['_emscripten_stack_get_end'] = function () {
      return (_emscripten_stack_get_end = Module['_emscripten_stack_get_end'] =
        Module['asm']['V']).apply(null, arguments);
    });
    var ___set_stack_limits = (Module['___set_stack_limits'] = function () {
      return (___set_stack_limits = Module['___set_stack_limits'] = Module['asm']['W']).apply(
        null,
        arguments
      );
    });
    var _asyncify_start_unwind = (Module['_asyncify_start_unwind'] = function () {
      return (_asyncify_start_unwind = Module['_asyncify_start_unwind'] = Module['asm']['X']).apply(
        null,
        arguments
      );
    });
    var _asyncify_stop_unwind = (Module['_asyncify_stop_unwind'] = function () {
      return (_asyncify_stop_unwind = Module['_asyncify_stop_unwind'] = Module['asm']['Y']).apply(
        null,
        arguments
      );
    });
    var _asyncify_start_rewind = (Module['_asyncify_start_rewind'] = function () {
      return (_asyncify_start_rewind = Module['_asyncify_start_rewind'] = Module['asm']['Z']).apply(
        null,
        arguments
      );
    });
    var _asyncify_stop_rewind = (Module['_asyncify_stop_rewind'] = function () {
      return (_asyncify_stop_rewind = Module['_asyncify_stop_rewind'] = Module['asm']['_']).apply(
        null,
        arguments
      );
    });
    Module['addFunction'] = addFunction;
    Module['writeStackCookie'] = writeStackCookie;
    Module['checkStackCookie'] = checkStackCookie;
    Module['Asyncify'] = Asyncify;
    var calledRun;
    function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function stackCheckInit() {
      _emscripten_stack_init();
      writeStackCookie();
    }
    function run(args) {
      args = args || arguments_;
      if (runDependencies > 0) {
        return;
      }
      stackCheckInit();
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module['calledRun'] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve(Module);
        if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
        postRun();
      }
      if (Module['setStatus']) {
        Module['setStatus']('Running...');
        setTimeout(function () {
          setTimeout(function () {
            Module['setStatus']('');
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
      checkStackCookie();
    }
    Module['run'] = run;
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
      }
    }
    run();

    return createQspModule.ready;
  };
})();
export default createQspModule;
