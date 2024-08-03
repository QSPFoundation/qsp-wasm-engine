var createQspModule = (() => {
  var _scriptName = import.meta.url;

  return async function (moduleArg = {}) {
    var moduleRtn;

    // include: shell.js
    // The Module object: Our interface to the outside world. We import
    // and export values on it. There are various ways Module can be used:
    // 1. Not defined. We create it here
    // 2. A function parameter, function(moduleArg) => Promise<Module>
    // 3. pre-run appended it, var Module = {}; ..generated code..
    // 4. External script tag defines var Module.
    // We need to check if Module already exists (e.g. case 3 above).
    // Substitution will be replaced with actual code on later stage of the build,
    // this way Closure Compiler will not mangle it (e.g. case 4. above).
    // Note that if you want to run closure, and also to use Module
    // after the generated code, you will need to define   var Module = {};
    // before the code. Then that object will be used in the code, and you
    // can continue to use Module afterwards as well.
    var Module = moduleArg;

    // Set up the promise that indicates the Module is initialized
    var readyPromiseResolve, readyPromiseReject;

    var readyPromise = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });

    [
      '_malloc',
      '_free',
      '_memory',
      '___asan_default_options',
      '_init',
      '_dispose',
      '_getVersion',
      '_setErrorCallback',
      '___indirect_function_table',
      '_getMainDesc',
      '_isMainDescChanged',
      '_getVarsDesc',
      '_isVarsDescChanged',
      '_getActions',
      '_selectAction',
      '_executeSelAction',
      '_isActionsChanged',
      '_getObjects',
      '_selectObject',
      '_isObjectsChanged',
      '_loadGameData',
      '_restartGame',
      '_saveGameData',
      '_loadSavedGameData',
      '_execString',
      '_execExpression',
      '_execCounter',
      '_execLoc',
      '_execUserInput',
      '_getLastErrorNum',
      '_getLastErrorLoc',
      '_getLastErrorActIndex',
      '_getLastErrorLine',
      '_getErrorDesc',
      '_getVarStringValue',
      '_getVarNumValue',
      '_getVarStringValueByKey',
      '_getVarNumValueByKey',
      '_getVarSize',
      '_initCallBacks',
      '_setCallBack',
      '_freeItemsList',
      '_freeSaveBuffer',
      '_freeStringsBuffer',
      '_enableDebugMode',
      '_disableDebugMode',
      '_getCurStateLoc',
      '_getCurStateLine',
      '_getCurStateActIndex',
      '_getLocationsList',
      '_getLocationCode',
      '_getActionCode',
      '__run_checks',
      '__ZN6__asan9FakeStack17AddrIsInFakeStackEm',
      '__ZN6__asan9FakeStack8AllocateEmmm',
      '___set_stack_limits',
      'onRuntimeInitialized',
    ].forEach((prop) => {
      if (!Object.getOwnPropertyDescriptor(readyPromise, prop)) {
        Object.defineProperty(readyPromise, prop, {
          get: () =>
            abort(
              'You are getting ' +
                prop +
                ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js',
            ),
          set: () =>
            abort(
              'You are setting ' +
                prop +
                ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js',
            ),
        });
      }
    });

    // Determine the runtime environment we are in. You can customize this by
    // setting the ENVIRONMENT setting at compile time (see settings.js).
    // Attempt to auto-detect the environment
    var ENVIRONMENT_IS_WEB = typeof window == 'object';

    var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';

    // N.b. Electron.js environment is simultaneously a NODE-environment, but
    // also a web environment.
    var ENVIRONMENT_IS_NODE =
      typeof process == 'object' &&
      typeof process.versions == 'object' &&
      typeof process.versions.node == 'string';

    var ENVIRONMENT_IS_SHELL =
      !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

    if (Module['ENVIRONMENT']) {
      throw new Error(
        'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)',
      );
    }

    if (ENVIRONMENT_IS_NODE) {
      // `require()` is no-op in an ESM module, use `createRequire()` to construct
      // the require()` function.  This is only necessary for multi-environment
      // builds, `-sENVIRONMENT=node` emits a static import declaration instead.
      // TODO: Swap all `require()`'s with `import()`'s?
      const { createRequire: createRequire } = await import('module');
      /** @suppress{duplicate} */ var require = createRequire(import.meta.url);
    }

    // --pre-jses are emitted after the Module integration code, so that they can
    // refer to Module (if they choose; they can also define Module)
    // Sometimes an existing Module object exists with properties
    // meant to overwrite the default module functionality. Here
    // we collect those properties and reapply _after_ we configure
    // the current environment's defaults to avoid having to be so
    // defensive during initialization.
    var moduleOverrides = Object.assign({}, Module);

    var arguments_ = [];

    var thisProgram = './this.program';

    var quit_ = (status, toThrow) => {
      throw toThrow;
    };

    // `/` should be present at the end if `scriptDirectory` is not empty
    var scriptDirectory = '';

    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }

    // Hooks that are implemented differently in different runtime environments.
    var readAsync, readBinary;

    if (ENVIRONMENT_IS_NODE) {
      if (typeof process == 'undefined' || !process.release || process.release.name !== 'node')
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)',
        );
      var nodeVersion = process.versions.node;
      var numericVersion = nodeVersion.split('.').slice(0, 3);
      numericVersion =
        numericVersion[0] * 1e4 + numericVersion[1] * 100 + numericVersion[2].split('-')[0] * 1;
      var minVersion = 16e4;
      if (numericVersion < 16e4) {
        throw new Error(
          'This emscripten-generated code requires node v16.0.0 (detected v' + nodeVersion + ')',
        );
      }
      // These modules will usually be used on Node.js. Load them eagerly to avoid
      // the complexity of lazy-loading.
      var fs = require('fs');
      var nodePath = require('path');
      // EXPORT_ES6 + ENVIRONMENT_IS_NODE always requires use of import.meta.url,
      // since there's no way getting the current absolute path of the module when
      // support for that is not available.
      scriptDirectory = require('url').fileURLToPath(new URL('./', import.meta.url));
      // includes trailing slash
      // include: node_shell_read.js
      readBinary = (filename) => {
        // We need to re-wrap `file://` strings to URLs. Normalizing isn't
        // necessary in that case, the path should already be absolute.
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        var ret = fs.readFileSync(filename);
        assert(ret.buffer);
        return ret;
      };
      readAsync = (filename, binary = true) => {
        // See the comment in the `readBinary` function.
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        return new Promise((resolve, reject) => {
          fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(binary ? data.buffer : data);
          });
        });
      };
      // end include: node_shell_read.js
      if (!Module['thisProgram'] && process.argv.length > 1) {
        thisProgram = process.argv[1].replace(/\\/g, '/');
      }
      arguments_ = process.argv.slice(2);
      // MODULARIZE will export the module in the proper place outside, we don't need to export here
      quit_ = (status, toThrow) => {
        process.exitCode = status;
        throw toThrow;
      };
    } else if (ENVIRONMENT_IS_SHELL) {
      if (
        (typeof process == 'object' && typeof require === 'function') ||
        typeof window == 'object' ||
        typeof importScripts == 'function'
      )
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)',
        );
    } // Note that this includes Node.js workers when relevant (pthreads is enabled).
    // Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
    // ENVIRONMENT_IS_NODE.
    else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        // Check worker, not web, since window could be polyfilled
        scriptDirectory = self.location.href;
      } else if (typeof document != 'undefined' && document.currentScript) {
        // web
        scriptDirectory = document.currentScript.src;
      }
      // When MODULARIZE, this JS may be executed later, after document.currentScript
      // is gone, so we saved it, and we use it here instead of any other info.
      if (_scriptName) {
        scriptDirectory = _scriptName;
      }
      // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
      // otherwise, slice off the final part of the url to find the script directory.
      // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
      // and scriptDirectory will correctly be replaced with an empty string.
      // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
      // they are removed because they could contain a slash.
      if (scriptDirectory.startsWith('blob:')) {
        scriptDirectory = '';
      } else {
        scriptDirectory = scriptDirectory.substr(
          0,
          scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1,
        );
      }
      if (!(typeof window == 'object' || typeof importScripts == 'function'))
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)',
        );
      {
        // include: web_or_worker_shell_read.js
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.responseType = 'arraybuffer';
            xhr.send(null);
            return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
          };
        }
        readAsync = (url) => {
          // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
          // See https://github.com/github/fetch/pull/92#issuecomment-140665932
          // Cordova or Electron apps are typically loaded from a file:// url.
          // So use XHR on webview if URL is a file URL.
          if (isFileURI(url)) {
            return new Promise((reject, resolve) => {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, true);
              xhr.responseType = 'arraybuffer';
              xhr.onload = () => {
                if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                  // file URLs can return 0
                  resolve(xhr.response);
                }
                reject(xhr.status);
              };
              xhr.onerror = reject;
              xhr.send(null);
            });
          }
          return fetch(url, {
            credentials: 'same-origin',
          }).then((response) => {
            if (response.ok) {
              return response.arrayBuffer();
            }
            return Promise.reject(new Error(response.status + ' : ' + response.url));
          });
        };
      }
    } // end include: web_or_worker_shell_read.js
    else {
      throw new Error('environment detection error');
    }

    var out = Module['print'] || console.log.bind(console);

    var err = Module['printErr'] || console.error.bind(console);

    // Merge back in the overrides
    Object.assign(Module, moduleOverrides);

    // Free the object hierarchy contained in the overrides, this lets the GC
    // reclaim data used.
    moduleOverrides = null;

    checkIncomingModuleAPI();

    // Emit code to handle expected values on the Module object. This applies Module.x
    // to the proper local x. This has two benefits: first, we only emit it if it is
    // expected to arrive, and second, by using a local everywhere else that can be
    // minified.
    if (Module['arguments']) arguments_ = Module['arguments'];

    legacyModuleProp('arguments', 'arguments_');

    if (Module['thisProgram']) thisProgram = Module['thisProgram'];

    legacyModuleProp('thisProgram', 'thisProgram');

    if (Module['quit']) quit_ = Module['quit'];

    legacyModuleProp('quit', 'quit_');

    // perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
    // Assertions on removed incoming Module JS APIs.
    assert(
      typeof Module['memoryInitializerPrefixURL'] == 'undefined',
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead',
    );

    assert(
      typeof Module['pthreadMainPrefixURL'] == 'undefined',
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead',
    );

    assert(
      typeof Module['cdInitializerPrefixURL'] == 'undefined',
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead',
    );

    assert(
      typeof Module['filePackagePrefixURL'] == 'undefined',
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead',
    );

    assert(typeof Module['read'] == 'undefined', 'Module.read option was removed');

    assert(
      typeof Module['readAsync'] == 'undefined',
      'Module.readAsync option was removed (modify readAsync in JS)',
    );

    assert(
      typeof Module['readBinary'] == 'undefined',
      'Module.readBinary option was removed (modify readBinary in JS)',
    );

    assert(
      typeof Module['setWindowTitle'] == 'undefined',
      'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)',
    );

    assert(
      typeof Module['TOTAL_MEMORY'] == 'undefined',
      'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY',
    );

    legacyModuleProp('asm', 'wasmExports');

    legacyModuleProp('readAsync', 'readAsync');

    legacyModuleProp('readBinary', 'readBinary');

    legacyModuleProp('setWindowTitle', 'setWindowTitle');

    var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';

    var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';

    var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';

    var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';

    var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';

    var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';

    var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';

    var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

    assert(
      !ENVIRONMENT_IS_SHELL,
      'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.',
    );

    // end include: shell.js
    // include: preamble.js
    // === Preamble library stuff ===
    // Documentation for the public APIs defined in this file must be updated in:
    //    site/source/docs/api_reference/preamble.js.rst
    // A prebuilt local version of the documentation is available at:
    //    site/build/text/docs/api_reference/preamble.js.txt
    // You can also build docs locally as HTML or other formats in site/
    // An online HTML version (which may be of a different version of Emscripten)
    //    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
    var wasmBinary;

    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];

    legacyModuleProp('wasmBinary', 'wasmBinary');

    if (typeof WebAssembly != 'object') {
      err('no native wasm support detected');
    }

    // include: runtime_asan.js
    // C versions of asan_js_{load|store}_* will be used from compiled code, which have
    // ASan instrumentation on them. However, until the wasm module is ready, we
    // must access things directly.
    /** @suppress{duplicate} */ function _asan_js_load_1(ptr) {
      if (runtimeInitialized) return __asan_c_load_1(ptr);
      return HEAP8[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_load_1u(ptr) {
      if (runtimeInitialized) return __asan_c_load_1u(ptr);
      return HEAPU8[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_load_2(ptr) {
      if (runtimeInitialized) return __asan_c_load_2(ptr);
      return HEAP16[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_load_2u(ptr) {
      if (runtimeInitialized) return __asan_c_load_2u(ptr);
      return HEAPU16[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_load_4(ptr) {
      if (runtimeInitialized) return __asan_c_load_4(ptr);
      return HEAP32[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_load_4u(ptr) {
      if (runtimeInitialized) return __asan_c_load_4u(ptr) >>> 0;
      return HEAPU32[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_load_f(ptr) {
      if (runtimeInitialized) return __asan_c_load_f(ptr);
      return HEAPF32[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_load_d(ptr) {
      if (runtimeInitialized) return __asan_c_load_d(ptr);
      return HEAPF64[ptr];
    }

    /** @suppress{duplicate} */ function _asan_js_store_1(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_1(ptr, val);
      return (HEAP8[ptr] = val);
    }

    /** @suppress{duplicate} */ function _asan_js_store_1u(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_1u(ptr, val);
      return (HEAPU8[ptr] = val);
    }

    /** @suppress{duplicate} */ function _asan_js_store_2(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_2(ptr, val);
      return (HEAP16[ptr] = val);
    }

    /** @suppress{duplicate} */ function _asan_js_store_2u(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_2u(ptr, val);
      return (HEAPU16[ptr] = val);
    }

    /** @suppress{duplicate} */ function _asan_js_store_4(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_4(ptr, val);
      return (HEAP32[ptr] = val);
    }

    /** @suppress{duplicate} */ function _asan_js_store_4u(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_4u(ptr, val) >>> 0;
      return (HEAPU32[ptr] = val);
    }

    /** @suppress{duplicate} */ function _asan_js_store_f(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_f(ptr, val);
      return (HEAPF32[ptr] = val);
    }

    /** @suppress{duplicate} */ function _asan_js_store_d(ptr, val) {
      if (runtimeInitialized) return __asan_c_store_d(ptr, val);
      return (HEAPF64[ptr] = val);
    }

    // end include: runtime_asan.js
    // Wasm globals
    var wasmMemory;

    //========================================
    // Runtime essentials
    //========================================
    // whether we are quitting the application. no code should run after this.
    // set in exit() and abort()
    var ABORT = false;

    // set by exit() and abort().  Passed to 'onExit' handler.
    // NOTE: This is also used as the process return code code in shell environments
    // but only when noExitRuntime is false.
    var EXITSTATUS;

    // In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
    // don't define it at all in release modes.  This matches the behaviour of
    // MINIMAL_RUNTIME.
    // TODO(sbc): Make this the default even without STRICT enabled.
    /** @type {function(*, string=)} */ function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed' + (text ? ': ' + text : ''));
      }
    }

    // We used to include malloc/free by default in the past. Show a helpful error in
    // builds with assertions.
    // Memory management
    var HEAP,
      /** @type {!Int8Array} */ HEAP8,
      /** @type {!Uint8Array} */ HEAPU8,
      /** @type {!Int16Array} */ HEAP16,
      /** @type {!Uint16Array} */ HEAPU16,
      /** @type {!Int32Array} */ HEAP32,
      /** @type {!Uint32Array} */ HEAPU32,
      /** @type {!Float32Array} */ HEAPF32,
      /** @type {!Float64Array} */ HEAPF64;

    // include: runtime_shared.js
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

    // end include: runtime_shared.js
    assert(
      !Module['STACK_SIZE'],
      'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time',
    );

    assert(
      typeof Int32Array != 'undefined' &&
        typeof Float64Array !== 'undefined' &&
        Int32Array.prototype.subarray != undefined &&
        Int32Array.prototype.set != undefined,
      'JS engine does not provide full typed array support',
    );

    // If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
    assert(
      !Module['wasmMemory'],
      'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally',
    );

    assert(
      !Module['INITIAL_MEMORY'],
      'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically',
    );

    // include: runtime_stack_check.js
    // Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
    function writeStackCookie() {
      var max = _emscripten_stack_get_end();
      assert((max & 3) == 0);
      // If the stack ends at address zero we write our cookies 4 bytes into the
      // stack.  This prevents interference with SAFE_HEAP and ASAN which also
      // monitor writes to address zero.
      if (max == 0) {
        max += 4;
      }
      // The stack grow downwards towards _emscripten_stack_get_end.
      // We write cookies to the final two words in the stack and detect if they are
      // ever overwritten.
      _asan_js_store_4u(max >> 2, 34821223);
      _asan_js_store_4u((max + 4) >> 2, 2310721022);
    }

    function checkStackCookie() {
      if (ABORT) return;
      var max = _emscripten_stack_get_end();
      // See writeStackCookie().
      if (max == 0) {
        max += 4;
      }
      var cookie1 = _asan_js_load_4u(max >> 2);
      var cookie2 = _asan_js_load_4u((max + 4) >> 2);
      if (cookie1 != 34821223 || cookie2 != 2310721022) {
        abort(
          `Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`,
        );
      }
    }

    // end include: runtime_stack_check.js
    // include: runtime_assertions.js
    // Endianness check
    (function () {
      var h16 = new Int16Array(1);
      var h8 = new Int8Array(h16.buffer);
      h16[0] = 25459;
      if (h8[0] !== 115 || h8[1] !== 99)
        throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
    })();

    // end include: runtime_assertions.js
    var __ATPRERUN__ = [];

    // functions called before the runtime is initialized
    var __ATINIT__ = [];

    // functions called during startup
    var __ATEXIT__ = [];

    // functions called during shutdown
    var __ATPOSTRUN__ = [];

    // functions called after the main() is called
    var runtimeInitialized = false;

    var runtimeExited = false;

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
      assert(!runtimeInitialized);
      runtimeInitialized = true;
      checkStackCookie();
      setStackLimits();
      callRuntimeCallbacks(__ATINIT__);
    }

    function exitRuntime() {
      assert(!runtimeExited);
      // ASYNCIFY cannot be used once the runtime starts shutting down.
      Asyncify.state = Asyncify.State.Disabled;
      checkStackCookie();
      ___funcs_on_exit();
      // Native atexit() functions
      callRuntimeCallbacks(__ATEXIT__);
      flush_NO_FILESYSTEM();
      runtimeExited = true;
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

    function addOnExit(cb) {
      __ATEXIT__.unshift(cb);
    }

    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }

    // include: runtime_math.js
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
    assert(
      Math.imul,
      'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill',
    );

    assert(
      Math.fround,
      'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill',
    );

    assert(
      Math.clz32,
      'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill',
    );

    assert(
      Math.trunc,
      'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill',
    );

    // end include: runtime_math.js
    // A counter of dependencies for calling run(). If we need to
    // do asynchronous work before running, increment this and
    // decrement it. Incrementing must happen in a place like
    // Module.preRun (used by emcc to add file preloading).
    // Note that you can add dependencies in preRun, even though
    // it happens right before run - run will be postponed until
    // the dependencies are met.
    var runDependencies = 0;

    var runDependencyWatcher = null;

    var dependenciesFulfilled = null;

    // overridden to take different actions when all run dependencies are fulfilled
    var runDependencyTracking = {};

    function getUniqueRunDependency(id) {
      var orig = id;
      while (1) {
        if (!runDependencyTracking[id]) return id;
        id = orig + Math.random();
      }
    }

    function addRunDependency(id) {
      runDependencies++;
      Module['monitorRunDependencies']?.(runDependencies);
      if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
          // Check for missing dependencies every few seconds
          runDependencyWatcher = setInterval(() => {
            if (ABORT) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
              return;
            }
            var shown = false;
            for (var dep in runDependencyTracking) {
              if (!shown) {
                shown = true;
                err('still waiting on run dependencies:');
              }
              err(`dependency: ${dep}`);
            }
            if (shown) {
              err('(end of list)');
            }
          }, 1e4);
        }
      } else {
        err('warning: run dependency added without ID');
      }
    }

    function removeRunDependency(id) {
      runDependencies--;
      Module['monitorRunDependencies']?.(runDependencies);
      if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id];
      } else {
        err('warning: run dependency removed without ID');
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

    /** @param {string|number=} what */ function abort(what) {
      Module['onAbort']?.(what);
      what = 'Aborted(' + what + ')';
      // TODO(sbc): Should we remove printing and leave it up to whoever
      // catches the exception?
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      if (what.indexOf('RuntimeError: unreachable') >= 0) {
        what +=
          '. "unreachable" may be due to ASYNCIFY_STACK_SIZE not being large enough (try increasing it)';
      }
      // Use a wasm runtime error, because a JS error might be seen as a foreign
      // exception, which means we'd run destructors on it. We need the error to
      // simply make the program stop.
      // FIXME This approach does not work in Wasm EH because it currently does not assume
      // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
      // a trap or not based on a hidden field within the object. So at the moment
      // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
      // allows this in the wasm spec.
      // Suppress closure compiler warning here. Closure compiler's builtin extern
      // definition for WebAssembly.RuntimeError claims it takes no arguments even
      // though it can.
      // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
      /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      // Throw the error whether or not MODULARIZE is set because abort is used
      // in code paths apart from instantiation where an exception is expected
      // to be thrown when abort is called.
      throw e;
    }

    // include: memoryprofiler.js
    // end include: memoryprofiler.js
    // show errors on likely calls to FS when it was not included
    var FS = {
      error() {
        abort(
          'Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM',
        );
      },
      init() {
        FS.error();
      },
      createDataFile() {
        FS.error();
      },
      createPreloadedFile() {
        FS.error();
      },
      createLazyFile() {
        FS.error();
      },
      open() {
        FS.error();
      },
      mkdev() {
        FS.error();
      },
      registerDevice() {
        FS.error();
      },
      analyzePath() {
        FS.error();
      },
      ErrnoError() {
        FS.error();
      },
    };

    Module['FS_createDataFile'] = FS.createDataFile;

    Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

    // include: URIUtils.js
    // Prefix of data URIs emitted by SINGLE_FILE and related options.
    var dataURIPrefix = 'data:application/octet-stream;base64,';

    /**
     * Indicates whether filename is a base64 data URI.
     * @noinline
     */ var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

    /**
     * Indicates whether filename is delivered via file protocol (as opposed to http/https)
     * @noinline
     */ var isFileURI = (filename) => filename.startsWith('file://');

    // end include: URIUtils.js
    function createExportWrapper(name, nargs) {
      return (...args) => {
        assert(
          runtimeInitialized,
          `native function \`${name}\` called before runtime initialization`,
        );
        assert(
          !runtimeExited,
          `native function \`${name}\` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)`,
        );
        var f = wasmExports[name];
        assert(f, `exported native function \`${name}\` not found`);
        // Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
        assert(
          args.length <= nargs,
          `native function \`${name}\` called with ${args.length} args but expects ${nargs}`,
        );
        return f(...args);
      };
    }

    // include: runtime_exceptions.js
    // end include: runtime_exceptions.js
    function findWasmBinary() {
      if (Module['locateFile']) {
        var f = 'qsp-engine-debug.wasm';
        if (!isDataURI(f)) {
          return locateFile(f);
        }
        return f;
      }
      // Use bundler-friendly `new URL(..., import.meta.url)` pattern; works in browsers too.
      return new URL('qsp-engine-debug.wasm', import.meta.url).href;
    }

    var wasmBinaryFile;

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
      // If we don't have the binary yet, load it asynchronously using readAsync.
      if (!wasmBinary) {
        // Fetch the binary using readAsync
        return readAsync(binaryFile).then(
          (response) => new Uint8Array(/** @type{!ArrayBuffer} */ (response)), // Fall back to getBinarySync if readAsync fails
          () => getBinarySync(binaryFile),
        );
      }
      // Otherwise, getBinarySync should be able to get it synchronously
      return Promise.resolve().then(() => getBinarySync(binaryFile));
    }

    var wasmSourceMap;

    // include: source_map_support.js
    /**
     * @constructor
     */ function WasmSourceMap(sourceMap) {
      this.version = sourceMap.version;
      this.sources = sourceMap.sources;
      this.names = sourceMap.names;
      this.mapping = {};
      this.offsets = [];
      var vlqMap = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        .split('')
        .forEach((c, i) => (vlqMap[c] = i));
      // based on https://github.com/Rich-Harris/vlq/blob/master/src/vlq.ts
      function decodeVLQ(string) {
        var result = [];
        var shift = 0;
        var value = 0;
        for (var i = 0; i < string.length; ++i) {
          var integer = vlqMap[string[i]];
          if (integer === undefined) {
            throw new Error('Invalid character (' + string[i] + ')');
          }
          value += (integer & 31) << shift;
          if (integer & 32) {
            shift += 5;
          } else {
            var negate = value & 1;
            value >>= 1;
            result.push(negate ? -value : value);
            value = shift = 0;
          }
        }
        return result;
      }
      var offset = 0,
        src = 0,
        line = 1,
        col = 1,
        name = 0;
      sourceMap.mappings.split(',').forEach(function (segment, index) {
        if (!segment) return;
        var data = decodeVLQ(segment);
        var info = {};
        offset += data[0];
        if (data.length >= 2) info.source = src += data[1];
        if (data.length >= 3) info.line = line += data[2];
        if (data.length >= 4) info.column = col += data[3];
        if (data.length >= 5) info.name = name += data[4];
        this.mapping[offset] = info;
        this.offsets.push(offset);
      }, this);
      this.offsets.sort((a, b) => a - b);
    }

    WasmSourceMap.prototype.lookup = function (offset) {
      var normalized = this.normalizeOffset(offset);
      if (!wasmOffsetConverter.isSameFunc(offset, normalized)) {
        return null;
      }
      var info = this.mapping[normalized];
      if (!info) {
        return null;
      }
      return {
        file: this.sources[info.source],
        line: info.line,
        column: info.column,
        name: this.names[info.name],
      };
    };

    WasmSourceMap.prototype.normalizeOffset = function (offset) {
      var lo = 0;
      var hi = this.offsets.length;
      var mid;
      while (lo < hi) {
        mid = Math.floor((lo + hi) / 2);
        if (this.offsets[mid] > offset) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      return this.offsets[lo - 1];
    };

    var wasmSourceMapFile = 'qsp-engine-debug.wasm.map';

    if (!isDataURI(wasmSourceMapFile)) {
      wasmSourceMapFile = locateFile(wasmSourceMapFile);
    }

    function getSourceMap() {
      var buf = readBinary(wasmSourceMapFile);
      return JSON.parse(UTF8ArrayToString(buf, 0, buf.length));
    }

    function getSourceMapPromise() {
      if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch == 'function') {
        return fetch(wasmSourceMapFile, {
          credentials: 'same-origin',
        })
          .then((response) => response.json())
          .catch(getSourceMap);
      }
      return Promise.resolve(getSourceMap());
    }

    // end include: source_map_support.js
    var wasmOffsetConverter;

    // include: wasm_offset_converter.js
    /** @constructor */ function WasmOffsetConverter(wasmBytes, wasmModule) {
      // This class parses a WASM binary file, and constructs a mapping from
      // function indices to the start of their code in the binary file, as well
      // as parsing the name section to allow conversion of offsets to function names.
      // The main purpose of this module is to enable the conversion of function
      // index and offset from start of function to an offset into the WASM binary.
      // This is needed to look up the WASM source map as well as generate
      // consistent program counter representations given v8's non-standard
      // WASM stack trace format.
      // v8 bug: https://crbug.com/v8/9172
      // This code is also used to check if the candidate source map offset is
      // actually part of the same function as the offset we are looking for,
      // as well as providing the function names for a given offset.
      // current byte offset into the WASM binary, as we parse it
      // the first section starts at offset 8.
      var offset = 8;
      // the index of the next function we see in the binary
      var funcidx = 0;
      // map from function index to byte offset in WASM binary
      this.offset_map = {};
      this.func_starts = [];
      // map from function index to names in WASM binary
      this.name_map = {};
      // number of imported functions this module has
      this.import_functions = 0;
      // the buffer unsignedLEB128 will read from.
      var buffer = wasmBytes;
      function unsignedLEB128() {
        // consumes an unsigned LEB128 integer starting at `offset`.
        // changes `offset` to immediately after the integer
        var result = 0;
        var shift = 0;
        do {
          var byte = buffer[offset++];
          result += (byte & 127) << shift;
          shift += 7;
        } while (byte & 128);
        return result;
      }
      function skipLimits() {
        var flags = unsignedLEB128();
        unsignedLEB128();
        // initial size
        var hasMax = (flags & 1) != 0;
        if (hasMax) {
          unsignedLEB128();
        }
      }
      binary_parse: while (offset < buffer.length) {
        var start = offset;
        var type = buffer[offset++];
        var end = unsignedLEB128() + offset;
        switch (type) {
          case 2:
            // import section
            // we need to find all function imports and increment funcidx for each one
            // since functions defined in the module are numbered after all imports
            var count = unsignedLEB128();
            while (count-- > 0) {
              // skip module
              offset = unsignedLEB128() + offset;
              // skip name
              offset = unsignedLEB128() + offset;
              var kind = buffer[offset++];
              switch (kind) {
                case 0:
                  // function import
                  ++funcidx;
                  unsignedLEB128();
                  // skip function type
                  break;

                case 1:
                  // table import
                  unsignedLEB128();
                  // skip elem type
                  skipLimits();
                  break;

                case 2:
                  // memory import
                  skipLimits();
                  break;

                case 3:
                  // global import
                  offset += 2;
                  // skip type id byte and mutability byte
                  break;

                case 4:
                  // tag import
                  ++offset;
                  // skip attribute
                  unsignedLEB128();
                  // skip tag type
                  break;

                default:
                  throw 'bad import kind: ' + kind;
              }
            }
            this.import_functions = funcidx;
            break;

          case 10:
            // code section
            var count = unsignedLEB128();
            while (count-- > 0) {
              var size = unsignedLEB128();
              this.offset_map[funcidx++] = offset;
              this.func_starts.push(offset);
              offset += size;
            }
            break binary_parse;
        }
        offset = end;
      }
      var sections = WebAssembly.Module.customSections(wasmModule, 'name');
      var nameSection = sections.length ? sections[0] : undefined;
      if (nameSection) {
        buffer = new Uint8Array(nameSection);
        offset = 0;
        while (offset < buffer.length) {
          var subsection_type = buffer[offset++];
          var len = unsignedLEB128();
          // byte count
          if (subsection_type != 1) {
            // Skip the whole sub-section if it's not a function name sub-section.
            offset += len;
            continue;
          }
          var count = unsignedLEB128();
          while (count-- > 0) {
            var index = unsignedLEB128();
            var length = unsignedLEB128();
            this.name_map[index] = UTF8ArrayToString(buffer, offset, length);
            offset += length;
          }
        }
      }
    }

    WasmOffsetConverter.prototype.convert = function (funcidx, offset) {
      return this.offset_map[funcidx] + offset;
    };

    WasmOffsetConverter.prototype.getIndex = function (offset) {
      var lo = 0;
      var hi = this.func_starts.length;
      var mid;
      while (lo < hi) {
        mid = Math.floor((lo + hi) / 2);
        if (this.func_starts[mid] > offset) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      return lo + this.import_functions - 1;
    };

    WasmOffsetConverter.prototype.isSameFunc = function (offset1, offset2) {
      return this.getIndex(offset1) == this.getIndex(offset2);
    };

    WasmOffsetConverter.prototype.getName = function (offset) {
      var index = this.getIndex(offset);
      return this.name_map[index] || 'wasm-function[' + index + ']';
    };

    // end include: wasm_offset_converter.js
    function receiveSourceMapJSON(sourceMap) {
      wasmSourceMap = new WasmSourceMap(sourceMap);
      removeRunDependency('source-map');
    }

    function instantiateArrayBuffer(binaryFile, imports, receiver) {
      var savedBinary;
      return getBinaryPromise(binaryFile)
        .then((binary) => {
          savedBinary = binary;
          return WebAssembly.instantiate(binary, imports);
        })
        .then((instance) => {
          // wasmOffsetConverter needs to be assigned before calling the receiver
          // (receiveInstantiationResult).  See comments below in instantiateAsync.
          wasmOffsetConverter = new WasmOffsetConverter(savedBinary, instance.module);
          return instance;
        })
        .then(receiver, (reason) => {
          err(`failed to asynchronously prepare wasm: ${reason}`);
          // Warn on some common problems.
          if (isFileURI(wasmBinaryFile)) {
            err(
              `warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`,
            );
          }
          abort(reason);
        });
    }

    function instantiateAsync(binary, binaryFile, imports, callback) {
      if (
        !binary &&
        typeof WebAssembly.instantiateStreaming == 'function' &&
        !isDataURI(binaryFile) && // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
        !isFileURI(binaryFile) && // Avoid instantiateStreaming() on Node.js environment for now, as while
        // Node.js v18.1.0 implements it, it does not have a full fetch()
        // implementation yet.
        // Reference:
        //   https://github.com/emscripten-core/emscripten/pull/16917
        !ENVIRONMENT_IS_NODE &&
        typeof fetch == 'function'
      ) {
        return fetch(binaryFile, {
          credentials: 'same-origin',
        }).then((response) => {
          // Suppress closure warning here since the upstream definition for
          // instantiateStreaming only allows Promise<Repsponse> rather than
          // an actual Response.
          // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
          /** @suppress {checkTypes} */ var result = WebAssembly.instantiateStreaming(
            response,
            imports,
          );
          // We need the wasm binary for the offset converter. Clone the response
          // in order to get its arrayBuffer (cloning should be more efficient
          // than doing another entire request).
          // (We must clone the response now in order to use it later, as if we
          // try to clone it asynchronously lower down then we will get a
          // "response was already consumed" error.)
          var clonedResponsePromise = response.clone().arrayBuffer();
          return result.then(
            function (instantiationResult) {
              // When using the offset converter, we must interpose here. First,
              // the instantiation result must arrive (if it fails, the error
              // handling later down will handle it). Once it arrives, we can
              // initialize the offset converter. And only then is it valid to
              // call receiveInstantiationResult, as that function will use the
              // offset converter (in the case of pthreads, it will create the
              // pthreads and send them the offsets along with the wasm instance).
              clonedResponsePromise.then(
                (arrayBufferResult) => {
                  wasmOffsetConverter = new WasmOffsetConverter(
                    new Uint8Array(arrayBufferResult),
                    instantiationResult.module,
                  );
                  callback(instantiationResult);
                },
                (reason) => err(`failed to initialize offset-converter: ${reason}`),
              );
            },
            function (reason) {
              // We expect the most common failure cause to be a bad MIME type for the binary,
              // in which case falling back to ArrayBuffer instantiation should work.
              err(`wasm streaming compile failed: ${reason}`);
              err('falling back to ArrayBuffer instantiation');
              return instantiateArrayBuffer(binaryFile, imports, callback);
            },
          );
        });
      }
      return instantiateArrayBuffer(binaryFile, imports, callback);
    }

    function getWasmImports() {
      // instrumenting imports is used in asyncify in two ways: to add assertions
      // that check for proper import use, and for ASYNCIFY=2 we use them to set up
      // the Promise API on the import side.
      Asyncify.instrumentWasmImports(wasmImports);
      // prepare imports
      return {
        env: wasmImports,
        wasi_snapshot_preview1: wasmImports,
      };
    }

    // Create the wasm instance.
    // Receives the wasm imports, returns the exports.
    function createWasm() {
      var info = getWasmImports();
      // Load the wasm module and create an instance of using native support in the JS engine.
      // handle a generated wasm instance, receiving its exports and
      // performing other necessary setup
      /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmExports = Asyncify.instrumentWasmExports(wasmExports);
        wasmMemory = wasmExports['memory'];
        assert(wasmMemory, 'memory not found in wasm exports');
        updateMemoryViews();
        wasmTable = wasmExports['__indirect_function_table'];
        assert(wasmTable, 'table not found in wasm exports');
        addOnInit(wasmExports['__wasm_call_ctors']);
        removeRunDependency('wasm-instantiate');
        return wasmExports;
      }
      // wait for the pthread pool (if any)
      addRunDependency('wasm-instantiate');
      addRunDependency('source-map');
      // Prefer streaming instantiation if available.
      // Async compilation can be confusing when an error on the page overwrites Module
      // (for example, if the order of elements is wrong, and the one defining Module is
      // later), so we save Module and check it later.
      var trueModule = Module;
      function receiveInstantiationResult(result) {
        // 'result' is a ResultObject object which has both the module and instance.
        // receiveInstance() will swap in the exports (to Module.asm) so they can be called
        assert(
          Module === trueModule,
          'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?',
        );
        trueModule = null;
        // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
        // When the regression is fixed, can restore the above PTHREADS-enabled path.
        receiveInstance(result['instance']);
      }
      // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
      // to manually instantiate the Wasm module themselves. This allows pages to
      // run the instantiation parallel to any other async startup actions they are
      // performing.
      // Also pthreads and wasm workers initialize the wasm instance through this
      // path.
      if (Module['instantiateWasm']) {
        try {
          return Module['instantiateWasm'](info, receiveInstance);
        } catch (e) {
          err(`Module.instantiateWasm callback failed with error: ${e}`);
          // If instantiation fails, reject the module ready promise.
          readyPromiseReject(e);
        }
      }
      if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
      // If instantiation fails, reject the module ready promise.
      instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(
        readyPromiseReject,
      );
      getSourceMapPromise().then(receiveSourceMapJSON);
      return {};
    }

    // Globals used by JS i64 conversions (see makeSetValue)
    var tempDouble;

    var tempI64;

    // include: runtime_debug.js
    function legacyModuleProp(prop, newName, incoming = true) {
      if (!Object.getOwnPropertyDescriptor(Module, prop)) {
        Object.defineProperty(Module, prop, {
          configurable: true,
          get() {
            let extra = incoming
              ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
              : '';
            abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);
          },
        });
      }
    }

    function ignoredModuleProp(prop) {
      if (Object.getOwnPropertyDescriptor(Module, prop)) {
        abort(
          `\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`,
        );
      }
    }

    // forcing the filesystem exports a few things by default
    function isExportedByForceFilesystem(name) {
      return (
        name === 'FS_createPath' ||
        name === 'FS_createDataFile' ||
        name === 'FS_createPreloadedFile' ||
        name === 'FS_unlink' ||
        name === 'addRunDependency' || // The old FS has some functionality that WasmFS lacks.
        name === 'FS_createLazyFile' ||
        name === 'FS_createDevice' ||
        name === 'removeRunDependency'
      );
    }

    function missingGlobal(sym, msg) {
      if (typeof globalThis != 'undefined') {
        Object.defineProperty(globalThis, sym, {
          configurable: true,
          get() {
            warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
            return undefined;
          },
        });
      }
    }

    missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');

    missingGlobal('asm', 'Please use wasmExports instead');

    function missingLibrarySymbol(sym) {
      if (typeof globalThis != 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
        Object.defineProperty(globalThis, sym, {
          configurable: true,
          get() {
            // Can't `abort()` here because it would break code that does runtime
            // checks.  e.g. `if (typeof SDL === 'undefined')`.
            var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
            // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
            // library.js, which means $name for a JS name with no prefix, or name
            // for a JS name like _name.
            var librarySymbol = sym;
            if (!librarySymbol.startsWith('_')) {
              librarySymbol = '$' + sym;
            }
            msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
            if (isExportedByForceFilesystem(sym)) {
              msg +=
                '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
            }
            warnOnce(msg);
            return undefined;
          },
        });
      }
      // Any symbol that is not included from the JS library is also (by definition)
      // not exported on the Module object.
      unexportedRuntimeSymbol(sym);
    }

    function unexportedRuntimeSymbol(sym) {
      if (!Object.getOwnPropertyDescriptor(Module, sym)) {
        Object.defineProperty(Module, sym, {
          configurable: true,
          get() {
            var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
            if (isExportedByForceFilesystem(sym)) {
              msg +=
                '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
            }
            abort(msg);
          },
        });
      }
    }

    // Used by XXXXX_DEBUG settings to output debug messages.
    function dbg(...args) {
      // TODO(sbc): Make this configurable somehow.  Its not always convenient for
      // logging to show up as warnings.
      console.warn(...args);
    }

    // end include: runtime_debug.js
    // === Body ===
    // end include: preamble.js
    /** @constructor */ function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }

    var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined;

    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
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
          if ((u0 & 248) != 240)
            warnOnce(
              'Invalid UTF-8 leading byte ' +
                ptrToString(u0) +
                ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!',
            );
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

    var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };

    /**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1':
          return _asan_js_load_1(ptr);

        case 'i8':
          return _asan_js_load_1(ptr);

        case 'i16':
          return _asan_js_load_2(ptr >> 1);

        case 'i32':
          return _asan_js_load_4(ptr >> 2);

        case 'i64':
          abort('to do getValue(i64) use WASM_BIGINT');

        case 'float':
          return _asan_js_load_f(ptr >> 2);

        case 'double':
          return _asan_js_load_d(ptr >> 3);

        case '*':
          return _asan_js_load_4u(ptr >> 2);

        default:
          abort(`invalid type for getValue: ${type}`);
      }
    }

    var noExitRuntime = Module['noExitRuntime'] || false;

    var ptrToString = (ptr) => {
      assert(typeof ptr === 'number');
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    };

    var setStackLimits = () => {
      var stackLow = _emscripten_stack_get_base();
      var stackHigh = _emscripten_stack_get_end();
      ___set_stack_limits(stackLow, stackHigh);
    };

    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1':
          _asan_js_store_1(ptr, value);
          break;

        case 'i8':
          _asan_js_store_1(ptr, value);
          break;

        case 'i16':
          _asan_js_store_2(ptr >> 1, value);
          break;

        case 'i32':
          _asan_js_store_4(ptr >> 2, value);
          break;

        case 'i64':
          abort('to do setValue(i64) use WASM_BIGINT');

        case 'float':
          _asan_js_store_f(ptr >> 2, value);
          break;

        case 'double':
          _asan_js_store_d(ptr >> 3, value);
          break;

        case '*':
          _asan_js_store_4u(ptr >> 2, value);
          break;

        default:
          abort(`invalid type for setValue: ${type}`);
      }
    }

    var stackRestore = (val) => __emscripten_stack_restore(val);

    var stackSave = () => _emscripten_stack_get_current();

    var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
        err(text);
      }
    };

    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => {
      assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };

    var ___assert_fail = (condition, filename, line, func) => {
      abort(
        `Assertion failed: ${UTF8ToString(condition)}, at: ` +
          [
            filename ? UTF8ToString(filename) : 'unknown filename',
            line,
            func ? UTF8ToString(func) : 'unknown function',
          ],
      );
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

    var SYSCALLS = {
      varargs: undefined,
      getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
    };

    var ___syscall_dup = (fd) => {
      abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
    };

    var ___syscall_mkdirat = (dirfd, path, mode) => {
      abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
    };

    function syscallGetVarargI() {
      assert(SYSCALLS.varargs != undefined);
      // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
      var ret = _asan_js_load_4(+SYSCALLS.varargs >> 2);
      SYSCALLS.varargs += 4;
      return ret;
    }

    function ___syscall_openat(dirfd, path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
    }

    var ___syscall_stat64 = (path, buf) => {
      abort('it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM');
    };

    var __abort_js = () => {
      abort('native code called abort()');
    };

    var nowIsMonotonic = 1;

    var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

    var getExecutableName = () => thisProgram || './this.program';

    var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i);
        // possibly a lead surrogate
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
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
          if (u > 1114111)
            warnOnce(
              'Invalid Unicode code point ' +
                ptrToString(u) +
                ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).',
            );
          heap[outIdx++] = 240 | (u >> 18);
          heap[outIdx++] = 128 | ((u >> 12) & 63);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };

    var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      assert(
        typeof maxBytesToWrite == 'number',
        'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!',
      );
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };

    var __emscripten_get_progname = (str, len) => {
      stringToUTF8(getExecutableName(), str, len);
    };

    /** @suppress{checkTypes} */ var withBuiltinMalloc = (func) => {
      var prev_malloc = typeof _malloc != 'undefined' ? _malloc : undefined;
      var prev_memalign = typeof _memalign != 'undefined' ? _memalign : undefined;
      var prev_free = typeof _free != 'undefined' ? _free : undefined;
      _malloc = _emscripten_builtin_malloc;
      _memalign = _emscripten_builtin_memalign;
      _free = _emscripten_builtin_free;
      try {
        return func();
      } finally {
        _malloc = prev_malloc;
        _memalign = prev_memalign;
        _free = prev_free;
      }
    };

    var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i);
        // possibly a lead surrogate
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

    var stringToNewUTF8 = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8(str, ret, size);
      return ret;
    };

    var __emscripten_sanitizer_get_option = (name) =>
      withBuiltinMalloc(() => stringToNewUTF8(Module[UTF8ToString(name)] || ''));

    var __emscripten_sanitizer_use_colors = () => {
      var setting = Module['printWithColors'];
      if (setting !== undefined) {
        return setting;
      }
      return ENVIRONMENT_IS_NODE && process.stderr.isTTY;
    };

    var convertI32PairToI53Checked = (lo, hi) => {
      assert(lo == lo >>> 0 || lo == (lo | 0));
      // lo should either be a i32 or a u32
      assert(hi === (hi | 0));
      // hi should be a i32
      return (hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
    };

    function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      return -52;
    }

    function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
    }

    var _emscripten_date_now = () => Date.now();

    var getHeapMax = () =>
      // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
      // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
      // for any code that deals with heap sizes, which would require special
      // casing all heap size related code to treat 0 specially.
      2147483648;

    var _emscripten_get_heap_max = () => getHeapMax();

    var _emscripten_get_now;

    // Modern environment where performance.now() is supported:
    // N.B. a shorter form "_emscripten_get_now = performance.now;" is
    // unfortunately not allowed even in current browsers (e.g. FF Nightly 75).
    _emscripten_get_now = () => performance.now();

    var UNWIND_CACHE = {};

    /** @returns {number} */ var convertFrameToPC = (frame) => {
      assert(wasmOffsetConverter);
      var match;
      if ((match = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(frame))) {
        // some engines give the binary offset directly, so we use that as return address
        return +match[1];
      } else if ((match = /\bwasm-function\[(\d+)\]:(\d+)/.exec(frame))) {
        // other engines only give function index and offset in the function,
        // so we try using the offset converter. If that doesn't work,
        // we pack index and offset into a "return address"
        return wasmOffsetConverter.convert(+match[1], +match[2]);
      } else if ((match = /:(\d+):\d+(?:\)|$)/.exec(frame))) {
        // If we are in js, we can use the js line number as the "return address".
        // This should work for wasm2js.  We tag the high bit to distinguish this
        // from wasm addresses.
        return 2147483648 | +match[1];
      }
      // return 0 if we can't find any
      return 0;
    };

    var convertPCtoSourceLocation = (pc) => {
      if (UNWIND_CACHE.last_get_source_pc == pc) return UNWIND_CACHE.last_source;
      var match;
      var source;
      if (wasmSourceMap) {
        source = wasmSourceMap.lookup(pc);
      }
      if (!source) {
        var frame = UNWIND_CACHE[pc];
        if (!frame) return null;
        // Example: at callMain (a.out.js:6335:22)
        if ((match = /\((.*):(\d+):(\d+)\)$/.exec(frame))) {
          source = {
            file: match[1],
            line: match[2],
            column: match[3],
          };
        } // Example: main@a.out.js:1337:42
        else if ((match = /@(.*):(\d+):(\d+)/.exec(frame))) {
          source = {
            file: match[1],
            line: match[2],
            column: match[3],
          };
        }
      }
      UNWIND_CACHE.last_get_source_pc = pc;
      UNWIND_CACHE.last_source = source;
      return source;
    };

    var _emscripten_pc_get_column = (pc) => {
      var result = convertPCtoSourceLocation(pc);
      return result ? result.column || 0 : 0;
    };

    var _emscripten_pc_get_file = (pc) =>
      withBuiltinMalloc(() => {
        var result = convertPCtoSourceLocation(pc);
        if (!result) return 0;
        if (_emscripten_pc_get_file.ret) _free(_emscripten_pc_get_file.ret);
        _emscripten_pc_get_file.ret = stringToNewUTF8(result.file);
        return _emscripten_pc_get_file.ret;
      });

    var _emscripten_pc_get_function = (pc) =>
      withBuiltinMalloc(() => {
        var name;
        if (pc & 2147483648) {
          // If this is a JavaScript function, try looking it up in the unwind cache.
          var frame = UNWIND_CACHE[pc];
          if (!frame) return 0;
          var match;
          if ((match = /^\s+at (.*) \(.*\)$/.exec(frame))) {
            name = match[1];
          } else if ((match = /^(.+?)@/.exec(frame))) {
            name = match[1];
          } else {
            return 0;
          }
        } else {
          name = wasmOffsetConverter.getName(pc);
        }
        if (_emscripten_pc_get_function.ret) _free(_emscripten_pc_get_function.ret);
        _emscripten_pc_get_function.ret = stringToNewUTF8(name);
        return _emscripten_pc_get_function.ret;
      });

    var _emscripten_pc_get_line = (pc) => {
      var result = convertPCtoSourceLocation(pc);
      return result ? result.line : 0;
    };

    var growMemory = (size) => {
      var b = wasmMemory.buffer;
      var pages = (size - b.byteLength + 65535) / 65536;
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow(pages);
        // .grow() takes a delta compared to the previous size
        updateMemoryViews();
        return 1;
      } /*success*/ catch (e) {
        err(
          `growMemory: Attempted to grow heap from ${b.byteLength} bytes to ${size} bytes, but got error: ${e}`,
        );
      }
    };

    // implicit 0 return to save code size (caller will cast "undefined" into 0
    // anyhow)
    var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      // With multithreaded builds, races can happen (another thread might increase the size
      // in between), so return a failure, and let the caller retry.
      assert(requestedSize > oldSize);
      // Memory resize rules:
      // 1.  Always increase heap size to at least the requested size, rounded up
      //     to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
      //     geometrically: increase the heap size according to
      //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
      //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
      //     linearly: increase the heap size by at least
      //     MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
      //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4.  If we were unable to allocate as much memory, it may be due to
      //     over-eager decision to excessively reserve due to (3) above.
      //     Hence if an allocation fails, cut down on the amount of excess
      //     growth, in an attempt to succeed to perform a smaller allocation.
      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        err(
          `Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`,
        );
        return false;
      }
      var alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
      // Loop through potential heap size increases. If we attempt a too eager
      // reservation that fails, cut down on the attempted size and reserve a
      // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(
          maxHeapSize,
          alignUp(Math.max(requestedSize, overGrownHeapSize), 65536),
        );
        var replacement = growMemory(newSize);
        if (replacement) {
          return true;
        }
      }
      err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
      return false;
    };

    function jsStackTrace() {
      return new Error().stack.toString();
    }

    var _emscripten_return_address = (level) => {
      var callstack = jsStackTrace().split('\n');
      if (callstack[0] == 'Error') {
        callstack.shift();
      }
      // skip this function and the caller to get caller's return address
      var caller = callstack[level + 3];
      return convertFrameToPC(caller);
    };

    var saveInUnwindCache = (callstack) => {
      callstack.forEach((frame) => {
        var pc = convertFrameToPC(frame);
        if (pc) {
          UNWIND_CACHE[pc] = frame;
        }
      });
    };

    function _emscripten_stack_snapshot() {
      var callstack = jsStackTrace().split('\n');
      if (callstack[0] == 'Error') {
        callstack.shift();
      }
      saveInUnwindCache(callstack);
      // Caches the stack snapshot so that emscripten_stack_unwind_buffer() can
      // unwind from this spot.
      UNWIND_CACHE.last_addr = convertFrameToPC(callstack[3]);
      UNWIND_CACHE.last_stack = callstack;
      return UNWIND_CACHE.last_addr;
    }

    var _emscripten_stack_unwind_buffer = (addr, buffer, count) => {
      var stack;
      if (UNWIND_CACHE.last_addr == addr) {
        stack = UNWIND_CACHE.last_stack;
      } else {
        stack = jsStackTrace().split('\n');
        if (stack[0] == 'Error') {
          stack.shift();
        }
        saveInUnwindCache(stack);
      }
      var offset = 3;
      while (stack[offset] && convertFrameToPC(stack[offset]) != addr) {
        ++offset;
      }
      for (var i = 0; i < count && stack[i + offset]; ++i) {
        _asan_js_store_4((buffer + i * 4) >> 2, convertFrameToPC(stack[i + offset]));
      }
      return i;
    };

    var ENV = {};

    var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
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
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
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
        assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
        _asan_js_store_1(buffer++, str.charCodeAt(i));
      }
      // Null-terminate the string
      _asan_js_store_1(buffer, 0);
    };

    var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        _asan_js_store_4u((__environ + i * 4) >> 2, ptr);
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };

    var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      _asan_js_store_4u(penviron_count >> 2, strings.length);
      var bufSize = 0;
      strings.forEach((string) => (bufSize += string.length + 1));
      _asan_js_store_4u(penviron_buf_size >> 2, bufSize);
      return 0;
    };

    var _fd_close = (fd) => {
      abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
    };

    var _fd_read = (fd, iov, iovcnt, pnum) => {
      abort('fd_read called without SYSCALLS_REQUIRE_FILESYSTEM');
    };

    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      return 70;
    }

    var printCharBuffers = [null, [], []];

    var printChar = (stream, curr) => {
      var buffer = printCharBuffers[stream];
      assert(buffer);
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    };

    var flush_NO_FILESYSTEM = () => {
      // flush anything remaining in the buffers during shutdown
      _fflush(0);
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    };

    var _fd_write = (fd, iov, iovcnt, pnum) => {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = _asan_js_load_4u(iov >> 2);
        var len = _asan_js_load_4u((iov + 4) >> 2);
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, _asan_js_load_1u(ptr + j));
        }
        num += len;
      }
      _asan_js_store_4u(pnum >> 2, num);
      return 0;
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

    var runAndAbortIfError = (func) => {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    };

    var handleException = (e) => {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
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

    /** @suppress {duplicate } */ /** @param {boolean|number=} implicit */ var exitJS = (
      status,
      implicit,
    ) => {
      EXITSTATUS = status;
      if (!keepRuntimeAlive()) {
        exitRuntime();
      }
      // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
      if (keepRuntimeAlive() && !implicit) {
        var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
        readyPromiseReject(msg);
        err(msg);
      }
      _proc_exit(status);
    };

    var _exit = exitJS;

    var maybeExit = () => {
      if (runtimeExited) {
        return;
      }
      if (!keepRuntimeAlive()) {
        try {
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    };

    var callUserCallback = (func) => {
      if (runtimeExited || ABORT) {
        err('user callback triggered after runtime exited or application aborted.  Ignoring.');
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
      assert(
        !sig.includes('j'),
        'i64 not permitted in function signatures when WASM_BIGINT is disabled',
      );
      var typeNames = {
        i: 'i32',
        j: 'i64',
        f: 'f32',
        d: 'f64',
        e: 'externref',
        p: 'i32',
      };
      var type = {
        parameters: [],
        results: sig[0] == 'v' ? [] : [typeNames[sig[0]]],
      };
      for (var i = 1; i < sig.length; ++i) {
        assert(sig[i] in typeNames, 'invalid signature char: ' + sig[i]);
        type.parameters.push(typeNames[sig[i]]);
      }
      return type;
    };

    var runtimeKeepalivePush = () => {
      runtimeKeepaliveCounter += 1;
    };

    var runtimeKeepalivePop = () => {
      assert(runtimeKeepaliveCounter > 0);
      runtimeKeepaliveCounter -= 1;
    };

    var Asyncify = {
      instrumentWasmImports(imports) {
        var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
        for (let [x, original] of Object.entries(imports)) {
          if (typeof original == 'function') {
            let isAsyncifyImport = original.isAsync || importPattern.test(x);
            imports[x] = (...args) => {
              var originalAsyncifyState = Asyncify.state;
              try {
                return original(...args);
              } finally {
                // Only asyncify-declared imports are allowed to change the
                // state.
                // Changing the state from normal to disabled is allowed (in any
                // function) as that is what shutdown does (and we don't have an
                // explicit list of shutdown imports).
                var changedToDisabled =
                  originalAsyncifyState === Asyncify.State.Normal &&
                  Asyncify.state === Asyncify.State.Disabled;
                // invoke_* functions are allowed to change the state if we do
                // not ignore indirect calls.
                var ignoredInvoke = x.startsWith('invoke_') && true;
                if (
                  Asyncify.state !== originalAsyncifyState &&
                  !isAsyncifyImport &&
                  !changedToDisabled &&
                  !ignoredInvoke
                ) {
                  throw new Error(`import ${x} was not in ASYNCIFY_IMPORTS, but changed the state`);
                }
              }
            };
          }
        }
      },
      instrumentWasmExports(exports) {
        var ret = {};
        for (let [x, original] of Object.entries(exports)) {
          if (typeof original == 'function') {
            ret[x] = (...args) => {
              Asyncify.exportCallStack.push(x);
              try {
                return original(...args);
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
        }
        return ret;
      },
      State: {
        Normal: 0,
        Unwinding: 1,
        Rewinding: 2,
        Disabled: 3,
      },
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
          // We just finished unwinding.
          // Be sure to set the state before calling any other functions to avoid
          // possible infinite recursion here (For example in debug pthread builds
          // the dbg() function itself can call back into WebAssembly to get the
          // current pthread_self() pointer).
          Asyncify.state = Asyncify.State.Normal;
          runtimeKeepalivePush();
          // Keep the runtime alive so that a re-wind can be done later.
          runAndAbortIfError(_asyncify_stop_unwind);
          if (typeof Fibers != 'undefined') {
            Fibers.trampoline();
          }
        }
      },
      whenDone() {
        assert(Asyncify.currData, 'Tried to wait for an async operation when none is in progress.');
        assert(
          !Asyncify.asyncPromiseHandlers,
          'Cannot have multiple async operations in flight at once',
        );
        return new Promise((resolve, reject) => {
          Asyncify.asyncPromiseHandlers = {
            resolve: resolve,
            reject: reject,
          };
        });
      },
      allocateData() {
        // An asyncify data structure has three fields:
        //  0  current stack pos
        //  4  max stack pos
        //  8  id of function at bottom of the call stack (callStackIdToName[id] == name of js function)
        // The Asyncify ABI only interprets the first two fields, the rest is for the runtime.
        // We also embed a stack in the same memory region here, right next to the structure.
        // This struct is also defined as asyncify_data_t in emscripten/fiber.h
        var ptr = _malloc(12 + Asyncify.StackSize);
        Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
        Asyncify.setDataRewindFunc(ptr);
        return ptr;
      },
      setDataHeader(ptr, stack, stackSize) {
        _asan_js_store_4u(ptr >> 2, stack);
        _asan_js_store_4u((ptr + 4) >> 2, stack + stackSize);
      },
      setDataRewindFunc(ptr) {
        var bottomOfCallStack = Asyncify.exportCallStack[0];
        var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
        _asan_js_store_4((ptr + 8) >> 2, rewindId);
      },
      getDataRewindFuncName(ptr) {
        var id = _asan_js_load_4((ptr + 8) >> 2);
        var name = Asyncify.callStackIdToName[id];
        return name;
      },
      getDataRewindFunc(name) {
        var func = wasmExports[name];
        return func;
      },
      doRewind(ptr) {
        var name = Asyncify.getDataRewindFuncName(ptr);
        var func = Asyncify.getDataRewindFunc(name);
        // Once we have rewound and the stack we no longer need to artificially
        // keep the runtime alive.
        runtimeKeepalivePop();
        return func();
      },
      handleSleep(startAsync) {
        assert(
          Asyncify.state !== Asyncify.State.Disabled,
          'Asyncify cannot be done during or after the runtime exits',
        );
        if (ABORT) return;
        if (Asyncify.state === Asyncify.State.Normal) {
          // Prepare to sleep. Call startAsync, and see what happens:
          // if the code decided to call our callback synchronously,
          // then no async operation was in fact begun, and we don't
          // need to do anything.
          var reachedCallback = false;
          var reachedAfterCallback = false;
          startAsync((handleSleepReturnValue = 0) => {
            assert(
              !handleSleepReturnValue ||
                typeof handleSleepReturnValue == 'number' ||
                typeof handleSleepReturnValue == 'boolean',
            );
            // old emterpretify API supported other stuff
            if (ABORT) return;
            Asyncify.handleSleepReturnValue = handleSleepReturnValue;
            reachedCallback = true;
            if (!reachedAfterCallback) {
              // We are happening synchronously, so no need for async.
              return;
            }
            // This async operation did not happen synchronously, so we did
            // unwind. In that case there can be no compiled code on the stack,
            // as it might break later operations (we can rewind ok now, but if
            // we unwind again, we would unwind through the extra compiled code
            // too).
            assert(
              !Asyncify.exportCallStack.length,
              'Waking up (starting to rewind) must be done from JS, without compiled code on the stack.',
            );
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
            // Track whether the return value was handled by any promise handlers.
            var handled = false;
            if (!Asyncify.currData) {
              // All asynchronous execution has finished.
              // `asyncWasmReturnValue` now contains the final
              // return value of the exported async WASM function.
              // Note: `asyncWasmReturnValue` is distinct from
              // `Asyncify.handleSleepReturnValue`.
              // `Asyncify.handleSleepReturnValue` contains the return
              // value of the last C function to have executed
              // `Asyncify.handleSleep()`, where as `asyncWasmReturnValue`
              // contains the return value of the exported WASM function
              // that may have called C functions that
              // call `Asyncify.handleSleep()`.
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
              // If there was an error and it was not handled by now, we have no choice but to
              // rethrow that error into the global scope where it can be caught only by
              // `onerror` or `onunhandledpromiserejection`.
              throw asyncWasmReturnValue;
            }
          });
          reachedAfterCallback = true;
          if (!reachedCallback) {
            // A true async operation was begun; start a sleep.
            Asyncify.state = Asyncify.State.Unwinding;
            // TODO: reuse, don't alloc/free every sleep
            Asyncify.currData = Asyncify.allocateData();
            if (typeof Browser != 'undefined' && Browser.mainLoop.func) {
              Browser.mainLoop.pause();
            }
            runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
          }
        } else if (Asyncify.state === Asyncify.State.Rewinding) {
          // Stop a resume.
          Asyncify.state = Asyncify.State.Normal;
          runAndAbortIfError(_asyncify_stop_rewind);
          _free(Asyncify.currData);
          Asyncify.currData = null;
          // Call all sleep callbacks now that the sleep-resume is all done.
          Asyncify.sleepCallbacks.forEach(callUserCallback);
        } else {
          abort(`invalid state: ${Asyncify.state}`);
        }
        return Asyncify.handleSleepReturnValue;
      },
      handleAsync(startAsync) {
        return Asyncify.handleSleep((wakeUp) => {
          // TODO: add error handling as a second param when handleSleep implements it.
          startAsync().then(wakeUp);
        });
      },
    };

    var uleb128Encode = (n, target) => {
      assert(n < 16384);
      if (n < 128) {
        target.push(n);
      } else {
        target.push(n % 128 | 128, n >> 7);
      }
    };

    var generateFuncType = (sig, target) => {
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = {
        i: 127,
        // i32
        p: 127,
        // i32
        j: 126,
        // i64
        f: 125,
        // f32
        d: 124,
        // f64
        e: 111,
      };
      // Parameters, length + signatures
      target.push(96);
      /* form: func */ uleb128Encode(sigParam.length, target);
      for (var i = 0; i < sigParam.length; ++i) {
        assert(sigParam[i] in typeCodes, 'invalid signature char: ' + sigParam[i]);
        target.push(typeCodes[sigParam[i]]);
      }
      // Return values, length + signatures
      // With no multi-return in MVP, either 0 (void) or 1 (anything else)
      if (sigRet == 'v') {
        target.push(0);
      } else {
        target.push(1, typeCodes[sigRet]);
      }
    };

    var convertJsFunctionToWasm = (func, sig) => {
      assert(
        !sig.includes('j'),
        'i64 not permitted in function signatures when WASM_BIGINT is disabled',
      );
      // If the type reflection proposal is available, use the new
      // "WebAssembly.Function" constructor.
      // Otherwise, construct a minimal wasm module importing the JS function and
      // re-exporting it.
      if (typeof WebAssembly.Function == 'function') {
        return new WebAssembly.Function(sigToWasmTypes(sig), func);
      }
      // The module is static, with the exception of the type section, which is
      // generated based on the signature passed in.
      var typeSectionBody = [1];
      // count: 1
      generateFuncType(sig, typeSectionBody);
      // Rest of the module is static
      var bytes = [
        0,
        97,
        115,
        109, // magic ("\0asm")
        1,
        0,
        0,
        0, // version: 1
        1,
      ];
      // Write the overall length of the type section followed by the body
      uleb128Encode(typeSectionBody.length, bytes);
      bytes.push(...typeSectionBody);
      // The rest of the module is static
      bytes.push(
        2,
        7, // import section
        // (import "e" "f" (func 0 (type 0)))
        1,
        1,
        101,
        1,
        102,
        0,
        0,
        7,
        5, // export section
        // (export "f" (func 0 (type 0)))
        1,
        1,
        102,
        0,
        0,
      );
      // We can compile this wasm module synchronously because it is very small.
      // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
      var module = new WebAssembly.Module(new Uint8Array(bytes));
      var instance = new WebAssembly.Instance(module, {
        e: {
          f: func,
        },
      });
      var wrappedFunc = instance.exports['f'];
      return wrappedFunc;
    };

    var wasmTableMirror = [];

    /** @type {WebAssembly.Table} */ var wasmTable;

    var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      assert(
        wasmTable.get(funcPtr) == func,
        'JavaScript-side Wasm function table mirror is out of date!',
      );
      return func;
    };

    var updateTableMap = (offset, count) => {
      if (functionsInTableMap) {
        for (var i = offset; i < offset + count; i++) {
          var item = getWasmTableEntry(i);
          // Ignore null values.
          if (item) {
            functionsInTableMap.set(item, i);
          }
        }
      }
    };

    var functionsInTableMap;

    var getFunctionAddress = (func) => {
      // First, create the map if this is the first use.
      if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap();
        updateTableMap(0, wasmTable.length);
      }
      return functionsInTableMap.get(func) || 0;
    };

    var freeTableIndexes = [];

    var getEmptyTableSlot = () => {
      // Reuse a free index if there is one, otherwise grow.
      if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
      }
      // Grow the table
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
      // With ABORT_ON_WASM_EXCEPTIONS wasmTable.get is overridden to return wrapped
      // functions so we need to call it here to retrieve the potential wrapper correctly
      // instead of just storing 'func' directly into wasmTableMirror
      wasmTableMirror[idx] = wasmTable.get(idx);
    };

    /** @param {string=} sig */ var addFunction = (func, sig) => {
      assert(typeof func != 'undefined');
      // Check if the function is already in the table, to ensure each function
      // gets a unique index.
      var rtn = getFunctionAddress(func);
      if (rtn) {
        return rtn;
      }
      // It's not in the table, add it now.
      var ret = getEmptyTableSlot();
      // Set the new value.
      try {
        // Attempting to call this with JS function will cause of table.set() to fail
        setWasmTableEntry(ret, func);
      } catch (err) {
        if (!(err instanceof TypeError)) {
          throw err;
        }
        assert(typeof sig != 'undefined', 'Missing signature argument to addFunction: ' + func);
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
      }
      functionsInTableMap.set(func, ret);
      return ret;
    };

    function checkIncomingModuleAPI() {
      ignoredModuleProp('fetchSettings');
    }

    var wasmImports = {
      /** @export */ __assert_fail: ___assert_fail,
      /** @export */ __handle_stack_overflow: ___handle_stack_overflow,
      /** @export */ __syscall_dup: ___syscall_dup,
      /** @export */ __syscall_mkdirat: ___syscall_mkdirat,
      /** @export */ __syscall_openat: ___syscall_openat,
      /** @export */ __syscall_stat64: ___syscall_stat64,
      /** @export */ _abort_js: __abort_js,
      /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
      /** @export */ _emscripten_get_progname: __emscripten_get_progname,
      /** @export */ _emscripten_sanitizer_get_option: __emscripten_sanitizer_get_option,
      /** @export */ _emscripten_sanitizer_use_colors: __emscripten_sanitizer_use_colors,
      /** @export */ _mmap_js: __mmap_js,
      /** @export */ _munmap_js: __munmap_js,
      /** @export */ emscripten_date_now: _emscripten_date_now,
      /** @export */ emscripten_get_heap_max: _emscripten_get_heap_max,
      /** @export */ emscripten_get_now: _emscripten_get_now,
      /** @export */ emscripten_pc_get_column: _emscripten_pc_get_column,
      /** @export */ emscripten_pc_get_file: _emscripten_pc_get_file,
      /** @export */ emscripten_pc_get_function: _emscripten_pc_get_function,
      /** @export */ emscripten_pc_get_line: _emscripten_pc_get_line,
      /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
      /** @export */ emscripten_return_address: _emscripten_return_address,
      /** @export */ emscripten_stack_snapshot: _emscripten_stack_snapshot,
      /** @export */ emscripten_stack_unwind_buffer: _emscripten_stack_unwind_buffer,
      /** @export */ environ_get: _environ_get,
      /** @export */ environ_sizes_get: _environ_sizes_get,
      /** @export */ fd_close: _fd_close,
      /** @export */ fd_read: _fd_read,
      /** @export */ fd_seek: _fd_seek,
      /** @export */ fd_write: _fd_write,
      /** @export */ proc_exit: _proc_exit,
    };

    var wasmExports = createWasm();

    var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors', 0);

    var ___asan_default_options = (Module['___asan_default_options'] = createExportWrapper(
      '__asan_default_options',
      0,
    ));

    var _init = (Module['_init'] = createExportWrapper('init', 0));

    var _dispose = (Module['_dispose'] = createExportWrapper('dispose', 0));

    var _getVersion = (Module['_getVersion'] = createExportWrapper('getVersion', 1));

    var _setErrorCallback = (Module['_setErrorCallback'] = createExportWrapper(
      'setErrorCallback',
      1,
    ));

    var _getMainDesc = (Module['_getMainDesc'] = createExportWrapper('getMainDesc', 1));

    var _isMainDescChanged = (Module['_isMainDescChanged'] = createExportWrapper(
      'isMainDescChanged',
      0,
    ));

    var _getVarsDesc = (Module['_getVarsDesc'] = createExportWrapper('getVarsDesc', 1));

    var _isVarsDescChanged = (Module['_isVarsDescChanged'] = createExportWrapper(
      'isVarsDescChanged',
      0,
    ));

    var _getActions = (Module['_getActions'] = createExportWrapper('getActions', 1));

    var _malloc = (Module['_malloc'] = createExportWrapper('malloc', 1));

    var _selectAction = (Module['_selectAction'] = createExportWrapper('selectAction', 1));

    var _executeSelAction = (Module['_executeSelAction'] = createExportWrapper(
      'executeSelAction',
      0,
    ));

    var _isActionsChanged = (Module['_isActionsChanged'] = createExportWrapper(
      'isActionsChanged',
      0,
    ));

    var _getObjects = (Module['_getObjects'] = createExportWrapper('getObjects', 1));

    var _selectObject = (Module['_selectObject'] = createExportWrapper('selectObject', 1));

    var _isObjectsChanged = (Module['_isObjectsChanged'] = createExportWrapper(
      'isObjectsChanged',
      0,
    ));

    var _loadGameData = (Module['_loadGameData'] = createExportWrapper('loadGameData', 3));

    var _restartGame = (Module['_restartGame'] = createExportWrapper('restartGame', 0));

    var _saveGameData = (Module['_saveGameData'] = createExportWrapper('saveGameData', 1));

    var _free = (Module['_free'] = createExportWrapper('free', 1));

    var _loadSavedGameData = (Module['_loadSavedGameData'] = createExportWrapper(
      'loadSavedGameData',
      2,
    ));

    var _execString = (Module['_execString'] = createExportWrapper('execString', 2));

    var _execExpression = (Module['_execExpression'] = createExportWrapper('execExpression', 1));

    var _execCounter = (Module['_execCounter'] = createExportWrapper('execCounter', 0));

    var _execLoc = (Module['_execLoc'] = createExportWrapper('execLoc', 1));

    var _execUserInput = (Module['_execUserInput'] = createExportWrapper('execUserInput', 1));

    var _getLastErrorNum = (Module['_getLastErrorNum'] = createExportWrapper('getLastErrorNum', 0));

    var _getLastErrorLoc = (Module['_getLastErrorLoc'] = createExportWrapper('getLastErrorLoc', 1));

    var _getLastErrorActIndex = (Module['_getLastErrorActIndex'] = createExportWrapper(
      'getLastErrorActIndex',
      0,
    ));

    var _getLastErrorLine = (Module['_getLastErrorLine'] = createExportWrapper(
      'getLastErrorLine',
      0,
    ));

    var _getErrorDesc = (Module['_getErrorDesc'] = createExportWrapper('getErrorDesc', 2));

    var _getVarStringValue = (Module['_getVarStringValue'] = createExportWrapper(
      'getVarStringValue',
      3,
    ));

    var _getVarNumValue = (Module['_getVarNumValue'] = createExportWrapper('getVarNumValue', 2));

    var _getVarStringValueByKey = (Module['_getVarStringValueByKey'] = createExportWrapper(
      'getVarStringValueByKey',
      3,
    ));

    var _getVarNumValueByKey = (Module['_getVarNumValueByKey'] = createExportWrapper(
      'getVarNumValueByKey',
      2,
    ));

    var _getVarSize = (Module['_getVarSize'] = createExportWrapper('getVarSize', 1));

    var _initCallBacks = (Module['_initCallBacks'] = createExportWrapper('initCallBacks', 0));

    var _setCallBack = (Module['_setCallBack'] = createExportWrapper('setCallBack', 2));

    var _freeItemsList = (Module['_freeItemsList'] = createExportWrapper('freeItemsList', 1));

    var _freeSaveBuffer = (Module['_freeSaveBuffer'] = createExportWrapper('freeSaveBuffer', 1));

    var _freeStringsBuffer = (Module['_freeStringsBuffer'] = createExportWrapper(
      'freeStringsBuffer',
      1,
    ));

    var _enableDebugMode = (Module['_enableDebugMode'] = createExportWrapper('enableDebugMode', 0));

    var _disableDebugMode = (Module['_disableDebugMode'] = createExportWrapper(
      'disableDebugMode',
      0,
    ));

    var _getCurStateLoc = (Module['_getCurStateLoc'] = createExportWrapper('getCurStateLoc', 1));

    var _getCurStateLine = (Module['_getCurStateLine'] = createExportWrapper('getCurStateLine', 0));

    var _getCurStateActIndex = (Module['_getCurStateActIndex'] = createExportWrapper(
      'getCurStateActIndex',
      0,
    ));

    var _getLocationsList = (Module['_getLocationsList'] = createExportWrapper(
      'getLocationsList',
      1,
    ));

    var _getLocationCode = (Module['_getLocationCode'] = createExportWrapper('getLocationCode', 2));

    var _getActionCode = (Module['_getActionCode'] = createExportWrapper('getActionCode', 3));

    var __run_checks = (Module['__run_checks'] = createExportWrapper('_run_checks', 0));

    var _fflush = createExportWrapper('fflush', 1);

    var ___funcs_on_exit = createExportWrapper('__funcs_on_exit', 0);

    var _emscripten_builtin_malloc = createExportWrapper('emscripten_builtin_malloc', 1);

    var _emscripten_builtin_free = createExportWrapper('emscripten_builtin_free', 1);

    var _emscripten_builtin_memalign = createExportWrapper('emscripten_builtin_memalign', 2);

    var _memalign = createExportWrapper('memalign', 2);

    var _emscripten_stack_init = () =>
      (_emscripten_stack_init = wasmExports['emscripten_stack_init'])();

    var _emscripten_stack_get_free = () =>
      (_emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'])();

    var _emscripten_stack_get_base = () =>
      (_emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'])();

    var _emscripten_stack_get_end = () =>
      (_emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'])();

    var __emscripten_stack_restore = (a0) =>
      (__emscripten_stack_restore = wasmExports['_emscripten_stack_restore'])(a0);

    var __emscripten_stack_alloc = (a0) =>
      (__emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'])(a0);

    var _emscripten_stack_get_current = () =>
      (_emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'])();

    var __ZN6__asan9FakeStack17AddrIsInFakeStackEm = (Module[
      '__ZN6__asan9FakeStack17AddrIsInFakeStackEm'
    ] = createExportWrapper('_ZN6__asan9FakeStack17AddrIsInFakeStackEm', 2));

    var __ZN6__asan9FakeStack8AllocateEmmm = (Module['__ZN6__asan9FakeStack8AllocateEmmm'] =
      createExportWrapper('_ZN6__asan9FakeStack8AllocateEmmm', 4));

    var __asan_c_load_1 = (a0) => (__asan_c_load_1 = wasmExports['_asan_c_load_1'])(a0);

    var __asan_c_load_1u = (a0) => (__asan_c_load_1u = wasmExports['_asan_c_load_1u'])(a0);

    var __asan_c_load_2 = (a0) => (__asan_c_load_2 = wasmExports['_asan_c_load_2'])(a0);

    var __asan_c_load_2u = (a0) => (__asan_c_load_2u = wasmExports['_asan_c_load_2u'])(a0);

    var __asan_c_load_4 = (a0) => (__asan_c_load_4 = wasmExports['_asan_c_load_4'])(a0);

    var __asan_c_load_4u = (a0) => (__asan_c_load_4u = wasmExports['_asan_c_load_4u'])(a0);

    var __asan_c_load_f = (a0) => (__asan_c_load_f = wasmExports['_asan_c_load_f'])(a0);

    var __asan_c_load_d = (a0) => (__asan_c_load_d = wasmExports['_asan_c_load_d'])(a0);

    var __asan_c_store_1 = (a0, a1) => (__asan_c_store_1 = wasmExports['_asan_c_store_1'])(a0, a1);

    var __asan_c_store_1u = (a0, a1) =>
      (__asan_c_store_1u = wasmExports['_asan_c_store_1u'])(a0, a1);

    var __asan_c_store_2 = (a0, a1) => (__asan_c_store_2 = wasmExports['_asan_c_store_2'])(a0, a1);

    var __asan_c_store_2u = (a0, a1) =>
      (__asan_c_store_2u = wasmExports['_asan_c_store_2u'])(a0, a1);

    var __asan_c_store_4 = (a0, a1) => (__asan_c_store_4 = wasmExports['_asan_c_store_4'])(a0, a1);

    var __asan_c_store_4u = (a0, a1) =>
      (__asan_c_store_4u = wasmExports['_asan_c_store_4u'])(a0, a1);

    var __asan_c_store_f = (a0, a1) => (__asan_c_store_f = wasmExports['_asan_c_store_f'])(a0, a1);

    var __asan_c_store_d = (a0, a1) => (__asan_c_store_d = wasmExports['_asan_c_store_d'])(a0, a1);

    var ___set_stack_limits = (Module['___set_stack_limits'] = createExportWrapper(
      '__set_stack_limits',
      2,
    ));

    var dynCall_vi = (Module['dynCall_vi'] = createExportWrapper('dynCall_vi', 2));

    var dynCall_ii = (Module['dynCall_ii'] = createExportWrapper('dynCall_ii', 2));

    var dynCall_viii = (Module['dynCall_viii'] = createExportWrapper('dynCall_viii', 4));

    var dynCall_iii = (Module['dynCall_iii'] = createExportWrapper('dynCall_iii', 3));

    var dynCall_iiiii = (Module['dynCall_iiiii'] = createExportWrapper('dynCall_iiiii', 5));

    var dynCall_iiii = (Module['dynCall_iiii'] = createExportWrapper('dynCall_iiii', 4));

    var dynCall_i = (Module['dynCall_i'] = createExportWrapper('dynCall_i', 1));

    var dynCall_viiiii = (Module['dynCall_viiiii'] = createExportWrapper('dynCall_viiiii', 6));

    var dynCall_viiiiii = (Module['dynCall_viiiiii'] = createExportWrapper('dynCall_viiiiii', 7));

    var dynCall_viiiiiiii = (Module['dynCall_viiiiiiii'] = createExportWrapper(
      'dynCall_viiiiiiii',
      9,
    ));

    var dynCall_v = (Module['dynCall_v'] = createExportWrapper('dynCall_v', 1));

    var dynCall_jiji = (Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji', 5));

    var dynCall_iiiiii = (Module['dynCall_iiiiii'] = createExportWrapper('dynCall_iiiiii', 6));

    var dynCall_iiiiiiii = (Module['dynCall_iiiiiiii'] = createExportWrapper(
      'dynCall_iiiiiiii',
      8,
    ));

    var dynCall_iidiiii = (Module['dynCall_iidiiii'] = createExportWrapper('dynCall_iidiiii', 7));

    var dynCall_vii = (Module['dynCall_vii'] = createExportWrapper('dynCall_vii', 3));

    var dynCall_viiii = (Module['dynCall_viiii'] = createExportWrapper('dynCall_viiii', 5));

    var dynCall_jii = (Module['dynCall_jii'] = createExportWrapper('dynCall_jii', 3));

    var _asyncify_start_unwind = createExportWrapper('asyncify_start_unwind', 1);

    var _asyncify_stop_unwind = createExportWrapper('asyncify_stop_unwind', 0);

    var _asyncify_start_rewind = createExportWrapper('asyncify_start_rewind', 1);

    var _asyncify_stop_rewind = createExportWrapper('asyncify_stop_rewind', 0);

    // include: postamble.js
    // === Auto-generated postamble setup entry stuff ===
    Module['addFunction'] = addFunction;

    Module['Asyncify'] = Asyncify;

    var missingLibrarySymbols = [
      'writeI53ToI64',
      'writeI53ToI64Clamped',
      'writeI53ToI64Signaling',
      'writeI53ToU64Clamped',
      'writeI53ToU64Signaling',
      'readI53FromI64',
      'readI53FromU64',
      'convertI32PairToI53',
      'convertU32PairToI53',
      'stackAlloc',
      'getTempRet0',
      'setTempRet0',
      'zeroMemory',
      'isLeapYear',
      'ydayFromDate',
      'arraySum',
      'addDays',
      'strError',
      'inetPton4',
      'inetNtop4',
      'inetPton6',
      'inetNtop6',
      'readSockaddr',
      'writeSockaddr',
      'initRandomFill',
      'randomFill',
      'emscriptenLog',
      'readEmAsmArgs',
      'jstoi_q',
      'listenOnce',
      'autoResumeAudioContext',
      'dynCallLegacy',
      'getDynCaller',
      'dynCall',
      'asmjsMangle',
      'asyncLoad',
      'alignMemory',
      'mmapAlloc',
      'HandleAllocator',
      'getNativeTypeSize',
      'STACK_SIZE',
      'STACK_ALIGN',
      'POINTER_SIZE',
      'ASSERTIONS',
      'getCFunc',
      'ccall',
      'cwrap',
      'removeFunction',
      'reallyNegative',
      'unSign',
      'strLen',
      'reSign',
      'formatString',
      'intArrayFromString',
      'intArrayToString',
      'AsciiToString',
      'UTF16ToString',
      'stringToUTF16',
      'lengthBytesUTF16',
      'UTF32ToString',
      'stringToUTF32',
      'lengthBytesUTF32',
      'stringToUTF8OnStack',
      'writeArrayToMemory',
      'registerKeyEventCallback',
      'maybeCStringToJsString',
      'findEventTarget',
      'getBoundingClientRect',
      'fillMouseEventData',
      'registerMouseEventCallback',
      'registerWheelEventCallback',
      'registerUiEventCallback',
      'registerFocusEventCallback',
      'fillDeviceOrientationEventData',
      'registerDeviceOrientationEventCallback',
      'fillDeviceMotionEventData',
      'registerDeviceMotionEventCallback',
      'screenOrientation',
      'fillOrientationChangeEventData',
      'registerOrientationChangeEventCallback',
      'fillFullscreenChangeEventData',
      'registerFullscreenChangeEventCallback',
      'JSEvents_requestFullscreen',
      'JSEvents_resizeCanvasForFullscreen',
      'registerRestoreOldStyle',
      'hideEverythingExceptGivenElement',
      'restoreHiddenElements',
      'setLetterbox',
      'softFullscreenResizeWebGLRenderTarget',
      'doRequestFullscreen',
      'fillPointerlockChangeEventData',
      'registerPointerlockChangeEventCallback',
      'registerPointerlockErrorEventCallback',
      'requestPointerLock',
      'fillVisibilityChangeEventData',
      'registerVisibilityChangeEventCallback',
      'registerTouchEventCallback',
      'fillGamepadEventData',
      'registerGamepadEventCallback',
      'registerBeforeUnloadEventCallback',
      'fillBatteryEventData',
      'battery',
      'registerBatteryEventCallback',
      'setCanvasElementSize',
      'getCanvasElementSize',
      'getCallstack',
      'checkWasiClock',
      'wasiRightsToMuslOFlags',
      'wasiOFlagsToMuslOFlags',
      'createDyncallWrapper',
      'safeSetTimeout',
      'setImmediateWrapped',
      'clearImmediateWrapped',
      'polyfillSetImmediate',
      'getPromise',
      'makePromise',
      'idsToPromises',
      'makePromiseCallback',
      'ExceptionInfo',
      'findMatchingCatch',
      'Browser_asyncPrepareDataCounter',
      'setMainLoop',
      'getSocketFromFD',
      'getSocketAddress',
      'heapObjectForWebGLType',
      'toTypedArrayIndex',
      'webgl_enable_ANGLE_instanced_arrays',
      'webgl_enable_OES_vertex_array_object',
      'webgl_enable_WEBGL_draw_buffers',
      'webgl_enable_WEBGL_multi_draw',
      'emscriptenWebGLGet',
      'computeUnpackAlignedImageSize',
      'colorChannelsInGlTextureFormat',
      'emscriptenWebGLGetTexPixelData',
      'emscriptenWebGLGetUniform',
      'webglGetUniformLocation',
      'webglPrepareUniformLocationsBeforeFirstUse',
      'webglGetLeftBracePos',
      'emscriptenWebGLGetVertexAttrib',
      '__glGetActiveAttribOrUniform',
      'writeGLArray',
      'registerWebGlEventCallback',
      'ALLOC_NORMAL',
      'ALLOC_STACK',
      'allocate',
      'writeStringToMemory',
      'writeAsciiToMemory',
      'setErrNo',
      'demangle',
      'stackTrace',
    ];

    missingLibrarySymbols.forEach(missingLibrarySymbol);

    var unexportedSymbols = [
      'run',
      'addOnPreRun',
      'addOnInit',
      'addOnPreMain',
      'addOnExit',
      'addOnPostRun',
      'addRunDependency',
      'removeRunDependency',
      'out',
      'err',
      'callMain',
      'abort',
      'wasmMemory',
      'wasmExports',
      'WasmOffsetConverter',
      'WasmSourceMap',
      'writeStackCookie',
      'checkStackCookie',
      'convertI32PairToI53Checked',
      'stackSave',
      'stackRestore',
      'ptrToString',
      'exitJS',
      'getHeapMax',
      'growMemory',
      'ENV',
      'setStackLimits',
      'MONTH_DAYS_REGULAR',
      'MONTH_DAYS_LEAP',
      'MONTH_DAYS_REGULAR_CUMULATIVE',
      'MONTH_DAYS_LEAP_CUMULATIVE',
      'ERRNO_CODES',
      'DNS',
      'Protocols',
      'Sockets',
      'timers',
      'warnOnce',
      'withBuiltinMalloc',
      'readEmAsmArgsArray',
      'jstoi_s',
      'getExecutableName',
      'handleException',
      'keepRuntimeAlive',
      'runtimeKeepalivePush',
      'runtimeKeepalivePop',
      'callUserCallback',
      'maybeExit',
      'wasmTable',
      'noExitRuntime',
      'uleb128Encode',
      'sigToWasmTypes',
      'generateFuncType',
      'convertJsFunctionToWasm',
      'freeTableIndexes',
      'functionsInTableMap',
      'getEmptyTableSlot',
      'updateTableMap',
      'getFunctionAddress',
      'setValue',
      'getValue',
      'PATH',
      'PATH_FS',
      'UTF8Decoder',
      'UTF8ArrayToString',
      'UTF8ToString',
      'stringToUTF8Array',
      'stringToUTF8',
      'lengthBytesUTF8',
      'stringToAscii',
      'UTF16Decoder',
      'stringToNewUTF8',
      'JSEvents',
      'specialHTMLTargets',
      'findCanvasEventTarget',
      'currentFullscreenStrategy',
      'restoreOldWindowedStyle',
      'jsStackTrace',
      'UNWIND_CACHE',
      'convertPCtoSourceLocation',
      'ExitStatus',
      'getEnvStrings',
      'flush_NO_FILESYSTEM',
      'promiseMap',
      'uncaughtExceptionCount',
      'exceptionLast',
      'exceptionCaught',
      'Browser',
      'getPreloadedImageData__data',
      'wget',
      'SYSCALLS',
      'tempFixedLengthArray',
      'miniTempWebGLFloatBuffers',
      'miniTempWebGLIntBuffers',
      'GL',
      'AL',
      'GLUT',
      'EGL',
      'GLEW',
      'IDBStore',
      'runAndAbortIfError',
      'Fibers',
      'SDL',
      'SDL_gfx',
      'allocateUTF8',
      'allocateUTF8OnStack',
      'print',
      'printErr',
    ];

    unexportedSymbols.forEach(unexportedRuntimeSymbol);

    var calledRun;

    dependenciesFulfilled = function runCaller() {
      // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };

    // try this again later, after new deps are fulfilled
    function stackCheckInit() {
      // This is normally called automatically during __wasm_call_ctors but need to
      // get these values before even running any of the ctors so we call it redundantly
      // here.
      _emscripten_stack_init();
      // TODO(sbc): Move writeStackCookie to native to to avoid this.
      writeStackCookie();
    }

    function run() {
      if (runDependencies > 0) {
        return;
      }
      stackCheckInit();
      preRun();
      // a preRun added a dependency, run will be called later
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        // run may have just been called through dependencies being fulfilled just in this very frame,
        // or while the async setStatus time below was happening
        if (calledRun) return;
        calledRun = true;
        Module['calledRun'] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve(Module);
        Module['onRuntimeInitialized']?.();
        assert(
          !Module['_main'],
          'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]',
        );
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

    // end include: postamble.js
    // include: postamble_modularize.js
    // In MODULARIZE mode we wrap the generated code in a factory function
    // and return either the Module itself, or a promise of the module.
    // We assign to the `moduleRtn` global here and configure closure to see
    // this as and extern so it won't get minified.
    moduleRtn = readyPromise;

    // Assertion for attempting to access module properties on the incoming
    // moduleArg.  In the past we used this object as the prototype of the module
    // and assigned properties to it, but now we return a distinct object.  This
    // keeps the instance private until it is ready (i.e the promise has been
    // resolved).
    for (const prop of Object.keys(Module)) {
      if (!(prop in moduleArg)) {
        Object.defineProperty(moduleArg, prop, {
          configurable: true,
          get() {
            abort(
              `Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`,
            );
          },
        });
      }
    }

    return moduleRtn;
  };
})();
export default createQspModule;
