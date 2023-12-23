var createQspModule = (() => {
  var _scriptDir = import.meta.url;

  return async function (moduleArg = {}) {
    var Module = moduleArg;
    var readyPromiseResolve, readyPromiseReject;
    Module['ready'] = new Promise((resolve, reject) => {
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
    var read_, readAsync, readBinary;
    if (ENVIRONMENT_IS_NODE) {
      const { createRequire: createRequire } = await import('module');
      var require = createRequire(import.meta.url);
      var fs = require('fs');
      var nodePath = require('path');
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
      } else {
        scriptDirectory = require('url').fileURLToPath(new URL('./', import.meta.url));
      }
      read_ = (filename, binary) => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        return fs.readFileSync(filename, binary ? undefined : 'utf8');
      };
      readBinary = (filename) => {
        var ret = read_(filename, true);
        if (!ret.buffer) {
          ret = new Uint8Array(ret);
        }
        return ret;
      };
      readAsync = (filename, onload, onerror, binary = true) => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
          if (err) onerror(err);
          else onload(binary ? data.buffer : data);
        });
      };
      if (!Module['thisProgram'] && process.argv.length > 1) {
        thisProgram = process.argv[1].replace(/\\/g, '/');
      }
      arguments_ = process.argv.slice(2);
      quit_ = (status, toThrow) => {
        process.exitCode = status;
        throw toThrow;
      };
      Module['inspect'] = () => '[Emscripten Module object]';
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
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
    } else {
    }
    var out = Module['print'] || console.log.bind(console);
    var err = Module['printErr'] || console.error.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module['arguments']) arguments_ = Module['arguments'];
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    if (Module['quit']) quit_ = Module['quit'];
    var wasmBinary;
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    if (typeof WebAssembly != 'object') {
      abort('no native wasm support detected');
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
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
    }
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
          `Stack overflow! Stack cookie has been overwritten at ${ptrToString(
            max
          )}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(
            cookie2
          )} ${ptrToString(cookie1)}`
        );
      }
      if (HEAPU32[0 >> 2] != 1668509029) {
        abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
      }
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
      setStackLimits();
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
      Module['monitorRunDependencies']?.(runDependencies);
    }
    function removeRunDependency(id) {
      runDependencies--;
      Module['monitorRunDependencies']?.(runDependencies);
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
      Module['onAbort']?.(what);
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
    var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
    var isFileURI = (filename) => filename.startsWith('file://');
    var wasmBinaryFile;
    if (Module['locateFile']) {
      wasmBinaryFile = 'qsp-engine.wasm';
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }
    } else {
      wasmBinaryFile = new URL('qsp-engine.wasm', import.meta.url).href;
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
    function getBinaryPromise(binaryFile) {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == 'function' && !isFileURI(binaryFile)) {
          return fetch(binaryFile, { credentials: 'same-origin' })
            .then((response) => {
              if (!response['ok']) {
                throw "failed to load wasm binary file at '" + binaryFile + "'";
              }
              return response['arrayBuffer']();
            })
            .catch(() => getBinarySync(binaryFile));
        } else if (readAsync) {
          return new Promise((resolve, reject) => {
            readAsync(binaryFile, (response) => resolve(new Uint8Array(response)), reject);
          });
        }
      }
      return Promise.resolve().then(() => getBinarySync(binaryFile));
    }
    function instantiateArrayBuffer(binaryFile, imports, receiver) {
      return getBinaryPromise(binaryFile)
        .then((binary) => WebAssembly.instantiate(binary, imports))
        .then((instance) => instance)
        .then(receiver, (reason) => {
          err(`failed to asynchronously prepare wasm: ${reason}`);
          abort(reason);
        });
    }
    function instantiateAsync(binary, binaryFile, imports, callback) {
      if (
        !binary &&
        typeof WebAssembly.instantiateStreaming == 'function' &&
        !isDataURI(binaryFile) &&
        !isFileURI(binaryFile) &&
        !ENVIRONMENT_IS_NODE &&
        typeof fetch == 'function'
      ) {
        return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
          var result = WebAssembly.instantiateStreaming(response, imports);
          return result.then(callback, function (reason) {
            err(`wasm streaming compile failed: ${reason}`);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(binaryFile, imports, callback);
          });
        });
      }
      return instantiateArrayBuffer(binaryFile, imports, callback);
    }
    function createWasm() {
      var info = { a: wasmImports };
      function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmExports = Asyncify.instrumentWasmExports(wasmExports);
        wasmMemory = wasmExports['g'];
        updateMemoryViews();
        wasmTable = wasmExports['V'];
        addOnInit(wasmExports['h']);
        removeRunDependency('wasm-instantiate');
        return wasmExports;
      }
      addRunDependency('wasm-instantiate');
      function receiveInstantiationResult(result) {
        receiveInstance(result['instance']);
      }
      if (Module['instantiateWasm']) {
        try {
          return Module['instantiateWasm'](info, receiveInstance);
        } catch (e) {
          err(`Module.instantiateWasm callback failed with error: ${e}`);
          readyPromiseReject(e);
        }
      }
      instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(
        readyPromiseReject
      );
      return {};
    }
    function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }
    var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
    };
    var noExitRuntime = Module['noExitRuntime'] || true;
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
          ']). If you require more stack space build with -sSTACK_SIZE=<bytes>'
      );
    };
    var _emscripten_date_now = () => Date.now();
    var _emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
    var getHeapMax = () => 2147483648;
    var growMemory = (size) => {
      var b = wasmMemory.buffer;
      var pages = (size - b.byteLength + 65535) / 65536;
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
      var alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(
          maxHeapSize,
          alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
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
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
    var stringToAscii = (str, buffer) => {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
      }
      HEAP8[buffer >> 0] = 0;
    };
    var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
    var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
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
      return str;
    };
    var UTF8ToString = (ptr, maxBytesToRead) =>
      ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    var SYSCALLS = {
      varargs: undefined,
      get() {
        var ret = HEAP32[+SYSCALLS.varargs >> 2];
        SYSCALLS.varargs += 4;
        return ret;
      },
      getp() {
        return SYSCALLS.get();
      },
      getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
    };
    var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[(__environ + i * 4) >> 2] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };
    var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => (bufSize += string.length + 1));
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
            'Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 5242880)'
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
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    };
    var sigToWasmTypes = (sig) => {
      var typeNames = { i: 'i32', j: 'i64', f: 'f32', d: 'f64', e: 'externref', p: 'i32' };
      var type = { parameters: [], results: sig[0] == 'v' ? [] : [typeNames[sig[0]]] };
      for (var i = 1; i < sig.length; ++i) {
        type.parameters.push(typeNames[sig[i]]);
      }
      return type;
    };
    var Asyncify = {
      instrumentWasmImports(imports) {
        var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
        for (let [x, original] of Object.entries(imports)) {
          let sig = original.sig;
          if (typeof original == 'function') {
            let isAsyncifyImport = original.isAsync || importPattern.test(x);
          }
        }
      },
      instrumentWasmExports(exports) {
        var ret = {};
        for (let [x, original] of Object.entries(exports)) {
          if (typeof original == 'function') {
            ret[x] = function () {
              Asyncify.exportCallStack.push(x);
              try {
                return original.apply(null, arguments);
              } finally {
                if (!ABORT) {
                  var y = Asyncify.exportCallStack.pop();
                  Asyncify.maybeStopUnwind();
                }
              }
            };
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
      callStackNameToId: {},
      callStackIdToName: {},
      callStackId: 0,
      asyncPromiseHandlers: null,
      sleepCallbacks: [],
      getCallStackId(funcName) {
        var id = Asyncify.callStackNameToId[funcName];
        if (id === undefined) {
          id = Asyncify.callStackId++;
          Asyncify.callStackNameToId[funcName] = id;
          Asyncify.callStackIdToName[id] = funcName;
        }
        return id;
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
          Asyncify.asyncPromiseHandlers = { resolve: resolve, reject: reject };
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
        var name = Asyncify.callStackIdToName[id];
        var func = wasmExports[name];
        return func;
      },
      doRewind(ptr) {
        var start = Asyncify.getDataRewindFunc(ptr);
        return start();
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
            runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
          }
        } else if (Asyncify.state === Asyncify.State.Rewinding) {
          Asyncify.state = Asyncify.State.Normal;
          runAndAbortIfError(_asyncify_stop_rewind);
          _free(Asyncify.currData);
          Asyncify.currData = null;
          Asyncify.sleepCallbacks.forEach((func) => callUserCallback(func));
        } else {
          abort(`invalid state: ${Asyncify.state}`);
        }
        return Asyncify.handleSleepReturnValue;
      },
      handleAsync(startAsync) {
        return Asyncify.handleSleep((wakeUp) => {
          startAsync().then(wakeUp);
        });
      },
    };
    var uleb128Encode = (n, target) => {
      if (n < 128) {
        target.push(n);
      } else {
        target.push(n % 128 | 128, n >> 7);
      }
    };
    var generateFuncType = (sig, target) => {
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
      target.push(96);
      uleb128Encode(sigParam.length, target);
      for (var i = 0; i < sigParam.length; ++i) {
        target.push(typeCodes[sigParam[i]]);
      }
      if (sigRet == 'v') {
        target.push(0);
      } else {
        target.push(1, typeCodes[sigRet]);
      }
    };
    var convertJsFunctionToWasm = (func, sig) => {
      if (typeof WebAssembly.Function == 'function') {
        return new WebAssembly.Function(sigToWasmTypes(sig), func);
      }
      var typeSectionBody = [1];
      generateFuncType(sig, typeSectionBody);
      var bytes = [0, 97, 115, 109, 1, 0, 0, 0, 1];
      uleb128Encode(typeSectionBody.length, bytes);
      bytes.push.apply(bytes, typeSectionBody);
      bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
      var module = new WebAssembly.Module(new Uint8Array(bytes));
      var instance = new WebAssembly.Instance(module, { e: { f: func } });
      var wrappedFunc = instance.exports['f'];
      return wrappedFunc;
    };
    var wasmTableMirror = [];
    var wasmTable;
    var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
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
      try {
        wasmTable.grow(1);
      } catch (err) {
        if (!(err instanceof RangeError)) {
          throw err;
        }
        throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
      }
      return wasmTable.length - 1;
    };
    var setWasmTableEntry = (idx, func) => {
      wasmTable.set(idx, func);
      wasmTableMirror[idx] = wasmTable.get(idx);
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
    var wasmImports = {
      a: ___handle_stack_overflow,
      e: _emscripten_date_now,
      f: _emscripten_memcpy_js,
      b: _emscripten_resize_heap,
      c: _environ_get,
      d: _environ_sizes_get,
    };
    var wasmExports = createWasm();
    var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports['h'])();
    var _init = (Module['_init'] = () => (_init = Module['_init'] = wasmExports['i'])());
    var _dispose = (Module['_dispose'] = () =>
      (_dispose = Module['_dispose'] = wasmExports['j'])());
    var _getVersion = (Module['_getVersion'] = (a0) =>
      (_getVersion = Module['_getVersion'] = wasmExports['k'])(a0));
    var _setErrorCallback = (Module['_setErrorCallback'] = (a0) =>
      (_setErrorCallback = Module['_setErrorCallback'] = wasmExports['l'])(a0));
    var _getMainDesc = (Module['_getMainDesc'] = (a0) =>
      (_getMainDesc = Module['_getMainDesc'] = wasmExports['m'])(a0));
    var _isMainDescChanged = (Module['_isMainDescChanged'] = () =>
      (_isMainDescChanged = Module['_isMainDescChanged'] = wasmExports['n'])());
    var _getVarsDesc = (Module['_getVarsDesc'] = (a0) =>
      (_getVarsDesc = Module['_getVarsDesc'] = wasmExports['o'])(a0));
    var _isVarsDescChanged = (Module['_isVarsDescChanged'] = () =>
      (_isVarsDescChanged = Module['_isVarsDescChanged'] = wasmExports['p'])());
    var _getActions = (Module['_getActions'] = (a0) =>
      (_getActions = Module['_getActions'] = wasmExports['q'])(a0));
    var _malloc = (Module['_malloc'] = (a0) =>
      (_malloc = Module['_malloc'] = wasmExports['r'])(a0));
    var _selectAction = (Module['_selectAction'] = (a0) =>
      (_selectAction = Module['_selectAction'] = wasmExports['s'])(a0));
    var _executeSelAction = (Module['_executeSelAction'] = () =>
      (_executeSelAction = Module['_executeSelAction'] = wasmExports['t'])());
    var _isActionsChanged = (Module['_isActionsChanged'] = () =>
      (_isActionsChanged = Module['_isActionsChanged'] = wasmExports['u'])());
    var _getObjects = (Module['_getObjects'] = (a0) =>
      (_getObjects = Module['_getObjects'] = wasmExports['v'])(a0));
    var _selectObject = (Module['_selectObject'] = (a0) =>
      (_selectObject = Module['_selectObject'] = wasmExports['w'])(a0));
    var _isObjectsChanged = (Module['_isObjectsChanged'] = () =>
      (_isObjectsChanged = Module['_isObjectsChanged'] = wasmExports['x'])());
    var _loadGameData = (Module['_loadGameData'] = (a0, a1, a2) =>
      (_loadGameData = Module['_loadGameData'] = wasmExports['y'])(a0, a1, a2));
    var _restartGame = (Module['_restartGame'] = () =>
      (_restartGame = Module['_restartGame'] = wasmExports['z'])());
    var _saveGameData = (Module['_saveGameData'] = (a0) =>
      (_saveGameData = Module['_saveGameData'] = wasmExports['A'])(a0));
    var _free = (Module['_free'] = (a0) => (_free = Module['_free'] = wasmExports['B'])(a0));
    var _loadSavedGameData = (Module['_loadSavedGameData'] = (a0, a1) =>
      (_loadSavedGameData = Module['_loadSavedGameData'] = wasmExports['C'])(a0, a1));
    var _execString = (Module['_execString'] = (a0, a1) =>
      (_execString = Module['_execString'] = wasmExports['D'])(a0, a1));
    var _execCounter = (Module['_execCounter'] = () =>
      (_execCounter = Module['_execCounter'] = wasmExports['E'])());
    var _execLoc = (Module['_execLoc'] = (a0) =>
      (_execLoc = Module['_execLoc'] = wasmExports['F'])(a0));
    var _execUserInput = (Module['_execUserInput'] = (a0) =>
      (_execUserInput = Module['_execUserInput'] = wasmExports['G'])(a0));
    var _getLastErrorNum = (Module['_getLastErrorNum'] = () =>
      (_getLastErrorNum = Module['_getLastErrorNum'] = wasmExports['H'])());
    var _getLastErrorLoc = (Module['_getLastErrorLoc'] = (a0) =>
      (_getLastErrorLoc = Module['_getLastErrorLoc'] = wasmExports['I'])(a0));
    var _getLastErrorActIndex = (Module['_getLastErrorActIndex'] = () =>
      (_getLastErrorActIndex = Module['_getLastErrorActIndex'] = wasmExports['J'])());
    var _getLastErrorLine = (Module['_getLastErrorLine'] = () =>
      (_getLastErrorLine = Module['_getLastErrorLine'] = wasmExports['K'])());
    var _getErrorDesc = (Module['_getErrorDesc'] = (a0, a1) =>
      (_getErrorDesc = Module['_getErrorDesc'] = wasmExports['L'])(a0, a1));
    var _getVarStringValue = (Module['_getVarStringValue'] = (a0, a1, a2) =>
      (_getVarStringValue = Module['_getVarStringValue'] = wasmExports['M'])(a0, a1, a2));
    var _getVarNumValue = (Module['_getVarNumValue'] = (a0, a1) =>
      (_getVarNumValue = Module['_getVarNumValue'] = wasmExports['N'])(a0, a1));
    var _getVarStringValueByKey = (Module['_getVarStringValueByKey'] = (a0, a1, a2) =>
      (_getVarStringValueByKey = Module['_getVarStringValueByKey'] = wasmExports['O'])(a0, a1, a2));
    var _getVarNumValueByKey = (Module['_getVarNumValueByKey'] = (a0, a1) =>
      (_getVarNumValueByKey = Module['_getVarNumValueByKey'] = wasmExports['P'])(a0, a1));
    var _getVarSize = (Module['_getVarSize'] = (a0) =>
      (_getVarSize = Module['_getVarSize'] = wasmExports['Q'])(a0));
    var _initCallBacks = (Module['_initCallBacks'] = () =>
      (_initCallBacks = Module['_initCallBacks'] = wasmExports['R'])());
    var _setCallBack = (Module['_setCallBack'] = (a0, a1) =>
      (_setCallBack = Module['_setCallBack'] = wasmExports['S'])(a0, a1));
    var _freeItemsList = (Module['_freeItemsList'] = (a0) =>
      (_freeItemsList = Module['_freeItemsList'] = wasmExports['T'])(a0));
    var _freeSaveBuffer = (Module['_freeSaveBuffer'] = (a0) =>
      (_freeSaveBuffer = Module['_freeSaveBuffer'] = wasmExports['U'])(a0));
    var ___errno_location = () => (___errno_location = wasmExports['__errno_location'])();
    var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports['W'])();
    var _emscripten_stack_get_free = () =>
      (_emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'])();
    var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports['X'])();
    var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports['Y'])();
    var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports['Z'])();
    var ___set_stack_limits = (Module['___set_stack_limits'] = (a0, a1) =>
      (___set_stack_limits = Module['___set_stack_limits'] = wasmExports['_'])(a0, a1));
    var _asyncify_start_unwind = (a0) => (_asyncify_start_unwind = wasmExports['$'])(a0);
    var _asyncify_stop_unwind = () => (_asyncify_stop_unwind = wasmExports['aa'])();
    var _asyncify_start_rewind = (a0) => (_asyncify_start_rewind = wasmExports['ba'])(a0);
    var _asyncify_stop_rewind = () => (_asyncify_stop_rewind = wasmExports['ca'])();
    Module['addFunction'] = addFunction;
    Module['Asyncify'] = Asyncify;
    var calledRun;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function stackCheckInit() {
      _emscripten_stack_init();
      writeStackCookie();
    }
    function run() {
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
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
      }
    }
    run();

    return moduleArg.ready;
  };
})();
export default createQspModule;
