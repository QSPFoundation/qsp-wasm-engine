var Module = (() => {
  var _scriptDir =
    typeof document !== 'undefined' && document.currentScript
      ? document.currentScript.src
      : undefined;

  return function (Module) {
    Module = Module || {};

    var Module = typeof Module != 'undefined' ? Module : {};
    var readyPromiseResolve, readyPromiseReject;
    Module['ready'] = new Promise(function (resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_main')) {
      Object.defineProperty(Module['ready'], '_main', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _main on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_main', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _main on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_init')) {
      Object.defineProperty(Module['ready'], '_init', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_init', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_dispose')) {
      Object.defineProperty(Module['ready'], '_dispose', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _dispose on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_dispose', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _dispose on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVersion')) {
      Object.defineProperty(Module['ready'], '_getVersion', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVersion on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVersion', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVersion on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_setErrorCallback')) {
      Object.defineProperty(Module['ready'], '_setErrorCallback', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _setErrorCallback on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_setErrorCallback', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _setErrorCallback on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getMainDesc')) {
      Object.defineProperty(Module['ready'], '_getMainDesc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getMainDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getMainDesc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getMainDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isMainDescChanged')) {
      Object.defineProperty(Module['ready'], '_isMainDescChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isMainDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isMainDescChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isMainDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVarsDesc')) {
      Object.defineProperty(Module['ready'], '_getVarsDesc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVarsDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVarsDesc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVarsDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isVarsDescChanged')) {
      Object.defineProperty(Module['ready'], '_isVarsDescChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isVarsDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isVarsDescChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isVarsDescChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getActions')) {
      Object.defineProperty(Module['ready'], '_getActions', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getActions on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getActions', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getActions on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_selectAction')) {
      Object.defineProperty(Module['ready'], '_selectAction', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _selectAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_selectAction', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _selectAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_executeSelAction')) {
      Object.defineProperty(Module['ready'], '_executeSelAction', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _executeSelAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_executeSelAction', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _executeSelAction on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isActionsChanged')) {
      Object.defineProperty(Module['ready'], '_isActionsChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isActionsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isActionsChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isActionsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getObjects')) {
      Object.defineProperty(Module['ready'], '_getObjects', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getObjects on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getObjects', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getObjects on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_selectObject')) {
      Object.defineProperty(Module['ready'], '_selectObject', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _selectObject on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_selectObject', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _selectObject on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_isObjectsChanged')) {
      Object.defineProperty(Module['ready'], '_isObjectsChanged', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _isObjectsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_isObjectsChanged', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _isObjectsChanged on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_loadGameData')) {
      Object.defineProperty(Module['ready'], '_loadGameData', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _loadGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_loadGameData', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _loadGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_restartGame')) {
      Object.defineProperty(Module['ready'], '_restartGame', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _restartGame on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_restartGame', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _restartGame on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_saveGameData')) {
      Object.defineProperty(Module['ready'], '_saveGameData', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _saveGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_saveGameData', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _saveGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_loadSavedGameData')) {
      Object.defineProperty(Module['ready'], '_loadSavedGameData', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _loadSavedGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_loadSavedGameData', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _loadSavedGameData on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execString')) {
      Object.defineProperty(Module['ready'], '_execString', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execString on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execString', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execString on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execCounter')) {
      Object.defineProperty(Module['ready'], '_execCounter', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execCounter on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execCounter', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execCounter on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execLoc')) {
      Object.defineProperty(Module['ready'], '_execLoc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execLoc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execLoc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execLoc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_execUserInput')) {
      Object.defineProperty(Module['ready'], '_execUserInput', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _execUserInput on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_execUserInput', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _execUserInput on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getLastErrorNum')) {
      Object.defineProperty(Module['ready'], '_getLastErrorNum', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getLastErrorNum on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getLastErrorNum', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getLastErrorNum on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getLastErrorLoc')) {
      Object.defineProperty(Module['ready'], '_getLastErrorLoc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getLastErrorLoc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getLastErrorLoc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getLastErrorLoc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getLastErrorActIndex')) {
      Object.defineProperty(Module['ready'], '_getLastErrorActIndex', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getLastErrorActIndex on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getLastErrorActIndex', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getLastErrorActIndex on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getLastErrorLine')) {
      Object.defineProperty(Module['ready'], '_getLastErrorLine', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getLastErrorLine on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getLastErrorLine', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getLastErrorLine on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getErrorDesc')) {
      Object.defineProperty(Module['ready'], '_getErrorDesc', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getErrorDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getErrorDesc', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getErrorDesc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVarStringValue')) {
      Object.defineProperty(Module['ready'], '_getVarStringValue', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVarStringValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVarStringValue', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVarStringValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_getVarNumValue')) {
      Object.defineProperty(Module['ready'], '_getVarNumValue', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _getVarNumValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_getVarNumValue', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _getVarNumValue on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_initCallBacks')) {
      Object.defineProperty(Module['ready'], '_initCallBacks', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _initCallBacks on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_initCallBacks', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _initCallBacks on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_setCallBack')) {
      Object.defineProperty(Module['ready'], '_setCallBack', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _setCallBack on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_setCallBack', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _setCallBack on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_freeItemsList')) {
      Object.defineProperty(Module['ready'], '_freeItemsList', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _freeItemsList on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_freeItemsList', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _freeItemsList on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_freeSaveBuffer')) {
      Object.defineProperty(Module['ready'], '_freeSaveBuffer', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _freeSaveBuffer on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_freeSaveBuffer', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _freeSaveBuffer on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '_fflush')) {
      Object.defineProperty(Module['ready'], '_fflush', {
        configurable: true,
        get: function () {
          abort(
            'You are getting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '_fflush', {
        configurable: true,
        set: function () {
          abort(
            'You are setting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], '___set_stack_limits')) {
      Object.defineProperty(Module['ready'], '___set_stack_limits', {
        configurable: true,
        get: function () {
          abort(
            'You are getting ___set_stack_limits on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], '___set_stack_limits', {
        configurable: true,
        set: function () {
          abort(
            'You are setting ___set_stack_limits on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
    if (!Object.getOwnPropertyDescriptor(Module['ready'], 'onRuntimeInitialized')) {
      Object.defineProperty(Module['ready'], 'onRuntimeInitialized', {
        configurable: true,
        get: function () {
          abort(
            'You are getting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
      Object.defineProperty(Module['ready'], 'onRuntimeInitialized', {
        configurable: true,
        set: function () {
          abort(
            'You are setting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'
          );
        },
      });
    }
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
    var ENVIRONMENT_IS_SHELL =
      !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
    if (Module['ENVIRONMENT']) {
      throw new Error(
        'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)'
      );
    }
    var scriptDirectory = '';
    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    function logExceptionOnExit(e) {
      if (e instanceof ExitStatus) return;
      let toLog = e;
      if (e && typeof e == 'object' && e.stack) {
        toLog = [e, e.stack];
      }
      err('exiting due to exception: ' + toLog);
    }
    if (ENVIRONMENT_IS_SHELL) {
      if (
        (typeof process == 'object' && typeof require === 'function') ||
        typeof window == 'object' ||
        typeof importScripts == 'function'
      )
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      if (typeof read != 'undefined') {
        read_ = function shell_read(f) {
          return read(f);
        };
      }
      readBinary = function readBinary(f) {
        let data;
        if (typeof readbuffer == 'function') {
          return new Uint8Array(readbuffer(f));
        }
        data = read(f, 'binary');
        assert(typeof data == 'object');
        return data;
      };
      readAsync = function readAsync(f, onload, onerror) {
        setTimeout(() => onload(readBinary(f)), 0);
      };
      if (typeof scriptArgs != 'undefined') {
        arguments_ = scriptArgs;
      } else if (typeof arguments != 'undefined') {
        arguments_ = arguments;
      }
      if (typeof quit == 'function') {
        quit_ = (status, toThrow) => {
          logExceptionOnExit(toThrow);
          quit(status);
        };
      }
      if (typeof print != 'undefined') {
        if (typeof console == 'undefined') console = {};
        console.log = print;
        console.warn = console.error = typeof printErr != 'undefined' ? printErr : print;
      }
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
      if (!(typeof window == 'object' || typeof importScripts == 'function'))
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
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
      throw new Error('environment detection error');
    }
    var out = Module['print'] || console.log.bind(console);
    var err = Module['printErr'] || console.warn.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    checkIncomingModuleAPI();
    if (Module['arguments']) arguments_ = Module['arguments'];
    legacyModuleProp('arguments', 'arguments_');
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    legacyModuleProp('thisProgram', 'thisProgram');
    if (Module['quit']) quit_ = Module['quit'];
    legacyModuleProp('quit', 'quit_');
    assert(
      typeof Module['memoryInitializerPrefixURL'] == 'undefined',
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['pthreadMainPrefixURL'] == 'undefined',
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['cdInitializerPrefixURL'] == 'undefined',
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['filePackagePrefixURL'] == 'undefined',
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['read'] == 'undefined',
      'Module.read option was removed (modify read_ in JS)'
    );
    assert(
      typeof Module['readAsync'] == 'undefined',
      'Module.readAsync option was removed (modify readAsync in JS)'
    );
    assert(
      typeof Module['readBinary'] == 'undefined',
      'Module.readBinary option was removed (modify readBinary in JS)'
    );
    assert(
      typeof Module['setWindowTitle'] == 'undefined',
      'Module.setWindowTitle option was removed (modify setWindowTitle in JS)'
    );
    assert(
      typeof Module['TOTAL_MEMORY'] == 'undefined',
      'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY'
    );
    legacyModuleProp('read', 'read_');
    legacyModuleProp('readAsync', 'readAsync');
    legacyModuleProp('readBinary', 'readBinary');
    legacyModuleProp('setWindowTitle', 'setWindowTitle');
    assert(
      !ENVIRONMENT_IS_NODE,
      "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable."
    );
    assert(
      !ENVIRONMENT_IS_SHELL,
      "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable."
    );
    var POINTER_SIZE = 4;
    function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }
    function uleb128Encode(n) {
      assert(n < 16384);
      if (n < 128) {
        return [n];
      }
      return [n % 128 | 128, n >> 7];
    }
    function sigToWasmTypes(sig) {
      var typeNames = { i: 'i32', j: 'i64', f: 'f32', d: 'f64', p: 'i32' };
      var type = { parameters: [], results: sig[0] == 'v' ? [] : [typeNames[sig[0]]] };
      for (var i = 1; i < sig.length; ++i) {
        assert(sig[i] in typeNames, 'invalid signature char: ' + sig[i]);
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
        assert(sigParam[i] in typeCodes, 'invalid signature char: ' + sigParam[i]);
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
      assert(typeof func != 'undefined');
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
        assert(typeof sig != 'undefined', 'Missing signature argument to addFunction: ' + func);
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
      }
      functionsInTableMap.set(func, ret);
      return ret;
    }
    function legacyModuleProp(prop, newName) {
      if (!Object.getOwnPropertyDescriptor(Module, prop)) {
        Object.defineProperty(Module, prop, {
          configurable: true,
          get: function () {
            abort(
              'Module.' +
                prop +
                ' has been replaced with plain ' +
                newName +
                ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
            );
          },
        });
      }
    }
    function ignoredModuleProp(prop) {
      if (Object.getOwnPropertyDescriptor(Module, prop)) {
        abort(
          '`Module.' +
            prop +
            '` was supplied but `' +
            prop +
            '` not included in INCOMING_MODULE_JS_API'
        );
      }
    }
    function unexportedMessage(sym, isFSSybol) {
      var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
      if (isFSSybol) {
        msg +=
          '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
      }
      return msg;
    }
    function unexportedRuntimeSymbol(sym, isFSSybol) {
      if (!Object.getOwnPropertyDescriptor(Module, sym)) {
        Object.defineProperty(Module, sym, {
          configurable: true,
          get: function () {
            abort(unexportedMessage(sym, isFSSybol));
          },
        });
      }
    }
    function unexportedRuntimeFunction(sym, isFSSybol) {
      if (!Object.getOwnPropertyDescriptor(Module, sym)) {
        Module[sym] = () => abort(unexportedMessage(sym, isFSSybol));
      }
    }
    var tempRet0 = 0;
    var setTempRet0 = (value) => {
      tempRet0 = value;
    };
    var wasmBinary;
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
    legacyModuleProp('wasmBinary', 'wasmBinary');
    var noExitRuntime = Module['noExitRuntime'] || true;
    legacyModuleProp('noExitRuntime', 'noExitRuntime');
    if (typeof WebAssembly != 'object') {
      abort('no native wasm support detected');
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed' + (text ? ': ' + text : ''));
      }
    }
    function getCFunc(ident) {
      var func = Module['_' + ident];
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
      return func;
    }
    function ccall(ident, returnType, argTypes, args, opts) {
      var toC = {
        string: function (str) {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) {
            var len = (str.length << 2) + 1;
            ret = stackAlloc(len);
            stringToUTF8(str, ret, len);
          }
          return ret;
        },
        array: function (arr) {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        },
      };
      function convertReturnValue(ret) {
        if (returnType === 'string') {
          return UTF8ToString(ret);
        }
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var previousAsync = Asyncify.currData;
      var ret = func.apply(null, cArgs);
      function onDone(ret) {
        runtimeKeepalivePop();
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
      runtimeKeepalivePush();
      var asyncMode = opts && opts.async;
      if (Asyncify.currData != previousAsync) {
        assert(
          !(previousAsync && Asyncify.currData),
          'We cannot start an async operation when one is already flight'
        );
        assert(
          !(previousAsync && !Asyncify.currData),
          'We cannot stop an async operation in flight'
        );
        assert(
          asyncMode,
          'The call to ' +
            ident +
            ' is running asynchronously. If this was intended, add the async option to the ccall/cwrap call.'
        );
        return Asyncify.whenDone().then(onDone);
      }
      ret = onDone(ret);
      if (asyncMode) return Promise.resolve(ret);
      return ret;
    }
    function cwrap(ident, returnType, argTypes, opts) {
      return function () {
        return ccall(ident, returnType, argTypes, arguments, opts);
      };
    }
    var ALLOC_STACK = 1;
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
            if ((u0 & 248) != 240)
              warnOnce(
                'Invalid UTF-8 leading byte 0x' +
                  u0.toString(16) +
                  ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!'
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
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
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
              'Invalid Unicode code point 0x' +
                u.toString(16) +
                ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).'
            );
          heap[outIdx++] = 240 | (u >> 18);
          heap[outIdx++] = 128 | ((u >> 12) & 63);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      assert(
        typeof maxBytesToWrite == 'number',
        'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
      );
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
          u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
        if (u <= 127) ++len;
        else if (u <= 2047) len += 2;
        else if (u <= 65535) len += 3;
        else len += 4;
      }
      return len;
    }
    var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
    function UTF32ToString(ptr, maxBytesToRead) {
      assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
      var i = 0;
      var str = '';
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[(ptr + i * 4) >> 2];
        if (utf32 == 0) break;
        ++i;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
      assert(
        typeof maxBytesToWrite == 'number',
        'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
      );
      if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
        len += 4;
      }
      return len;
    }
    function writeArrayToMemory(array, buffer) {
      assert(
        array.length >= 0,
        'writeArrayToMemory array must have a length (should be an array or typed array)'
      );
      HEAP8.set(array, buffer);
    }
    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
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
    var TOTAL_STACK = 5242880;
    if (Module['TOTAL_STACK'])
      assert(
        TOTAL_STACK === Module['TOTAL_STACK'],
        'the stack size can no longer be determined at runtime'
      );
    var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 268435456;
    legacyModuleProp('INITIAL_MEMORY', 'INITIAL_MEMORY');
    assert(
      INITIAL_MEMORY >= TOTAL_STACK,
      'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' +
        INITIAL_MEMORY +
        '! (TOTAL_STACK=' +
        TOTAL_STACK +
        ')'
    );
    assert(
      typeof Int32Array != 'undefined' &&
        typeof Float64Array !== 'undefined' &&
        Int32Array.prototype.subarray != undefined &&
        Int32Array.prototype.set != undefined,
      'JS engine does not provide full typed array support'
    );
    assert(
      !Module['wasmMemory'],
      'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally'
    );
    assert(
      INITIAL_MEMORY == 268435456,
      'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically'
    );
    var wasmTable;
    function writeStackCookie() {
      var max = _emscripten_stack_get_end();
      assert((max & 3) == 0);
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
    (function () {
      var h16 = new Int16Array(1);
      var h8 = new Int8Array(h16.buffer);
      h16[0] = 25459;
      if (h8[0] !== 115 || h8[1] !== 99)
        throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
    })();
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function keepRuntimeAlive() {
      return noExitRuntime;
    }
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
    assert(
      Math.imul,
      'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    assert(
      Math.fround,
      'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    assert(
      Math.clz32,
      'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    assert(
      Math.trunc,
      'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill'
    );
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    var runDependencyTracking = {};
    function addRunDependency(id) {
      runDependencies++;
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
      if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
          runDependencyWatcher = setInterval(function () {
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
              err('dependency: ' + dep);
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
      if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
      }
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
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var FS = {
      error: function () {
        abort(
          'Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM'
        );
      },
      init: function () {
        FS.error();
      },
      createDataFile: function () {
        FS.error();
      },
      createPreloadedFile: function () {
        FS.error();
      },
      createLazyFile: function () {
        FS.error();
      },
      open: function () {
        FS.error();
      },
      mkdev: function () {
        FS.error();
      },
      registerDevice: function () {
        FS.error();
      },
      analyzePath: function () {
        FS.error();
      },
      loadFilesFromDB: function () {
        FS.error();
      },
      ErrnoError: function ErrnoError() {
        FS.error();
      },
    };
    Module['FS_createDataFile'] = FS.createDataFile;
    Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
    var dataURIPrefix = 'data:application/octet-stream;base64,';
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    function isFileURI(filename) {
      return filename.startsWith('file://');
    }
    function createExportWrapper(name, fixedasm) {
      return function () {
        var displayName = name;
        var asm = fixedasm;
        if (!fixedasm) {
          asm = Module['asm'];
        }
        assert(
          runtimeInitialized,
          'native function `' + displayName + '` called before runtime initialization'
        );
        if (!asm[name]) {
          assert(asm[name], 'exported native function `' + displayName + '` not found');
        }
        return asm[name].apply(null, arguments);
      };
    }
    var wasmBinaryFile;
    wasmBinaryFile = 'qsp-wasm.wasm';
    if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile);
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
        if (typeof fetch == 'function') {
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
        }
      }
      return Promise.resolve().then(function () {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = { env: asmLibraryArg, wasi_snapshot_preview1: asmLibraryArg };
      function receiveInstance(instance, module) {
        var exports = instance.exports;
        exports = Asyncify.instrumentWasmExports(exports);
        Module['asm'] = exports;
        wasmMemory = Module['asm']['memory'];
        assert(wasmMemory, 'memory not found in wasm exports');
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module['asm']['__indirect_function_table'];
        assert(wasmTable, 'table not found in wasm exports');
        addOnInit(Module['asm']['__wasm_call_ctors']);
        removeRunDependency('wasm-instantiate');
      }
      addRunDependency('wasm-instantiate');
      var trueModule = Module;
      function receiveInstantiationResult(result) {
        assert(
          Module === trueModule,
          'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?'
        );
        trueModule = null;
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
            if (isFileURI(wasmBinaryFile)) {
              err(
                'warning: Loading from a file URI (' +
                  wasmBinaryFile +
                  ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing'
              );
            }
            abort(reason);
          });
      }
      function instantiateAsync() {
        if (
          !wasmBinary &&
          typeof WebAssembly.instantiateStreaming == 'function' &&
          !isDataURI(wasmBinaryFile) &&
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
    var tempDouble;
    var tempI64;
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
    }
    function demangle(func) {
      warnOnce('warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling');
      return func;
    }
    function demangleAll(text) {
      var regex = /\b_Z[\w\d_]+/g;
      return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + ' [' + x + ']';
      });
    }
    function getValue(ptr, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1':
          return HEAP8[ptr >> 0];
        case 'i8':
          return HEAP8[ptr >> 0];
        case 'i16':
          return HEAP16[ptr >> 1];
        case 'i32':
          return HEAP32[ptr >> 2];
        case 'i64':
          return HEAP32[ptr >> 2];
        case 'float':
          return HEAPF32[ptr >> 2];
        case 'double':
          return HEAPF64[ptr >> 3];
        case '*':
          return HEAPU32[ptr >> 2];
        default:
          abort('invalid type for getValue: ' + type);
      }
      return null;
    }
    var wasmTableMirror = [];
    function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      assert(
        wasmTable.get(funcPtr) == func,
        'JavaScript-side Wasm function table mirror is out of date!'
      );
      return func;
    }
    function handleException(e) {
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    }
    function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        try {
          throw new Error();
        } catch (e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
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
      } catch (e) {
        err(
          'emscripten_realloc_buffer: Attempted to grow heap from ' +
            buffer.byteLength +
            ' bytes to ' +
            size +
            ' bytes, but got error: ' +
            e
        );
      }
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      assert(requestedSize > oldSize);
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        err(
          'Cannot enlarge memory, asked to go up to ' +
            requestedSize +
            ' bytes, but the limit is ' +
            maxHeapSize +
            ' bytes!'
        );
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
      err(
        'Failed to grow the heap from ' +
          oldSize +
          ' bytes to ' +
          newSize +
          ' bytes, not enough memory!'
      );
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
        assert(SYSCALLS.varargs != undefined);
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
    var printCharBuffers = [null, [], []];
    function printChar(stream, curr) {
      var buffer = printCharBuffers[stream];
      assert(buffer);
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    }
    function flush_NO_FILESYSTEM() {
      _fflush(0);
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr + j]);
        }
        num += len;
      }
      HEAPU32[pnum >> 2] = num;
      return 0;
    }
    function _setTempRet0(val) {
      setTempRet0(val);
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
        err('user callback triggered after runtime exited or application aborted.  Ignoring.');
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
    function runtimeKeepalivePush() {}
    function runtimeKeepalivePop() {}
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
              imports[x] = function () {
                var originalAsyncifyState = Asyncify.state;
                try {
                  return original.apply(null, arguments);
                } finally {
                  var changedToDisabled =
                    originalAsyncifyState === Asyncify.State.Normal &&
                    Asyncify.state === Asyncify.State.Disabled;
                  var ignoredInvoke = x.startsWith('invoke_') && true;
                  if (
                    Asyncify.state !== originalAsyncifyState &&
                    !isAsyncifyImport &&
                    !changedToDisabled &&
                    !ignoredInvoke
                  ) {
                    throw new Error(
                      'import ' + x + ' was not in ASYNCIFY_IMPORTS, but changed the state'
                    );
                  }
                }
              };
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
        assert(Asyncify.currData, 'Tried to wait for an async operation when none is in progress.');
        assert(
          !Asyncify.asyncPromiseHandlers,
          'Cannot have multiple async operations in flight at once'
        );
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
        assert(
          Asyncify.state !== Asyncify.State.Disabled,
          'Asyncify cannot be done during or after the runtime exits'
        );
        if (ABORT) return;
        if (Asyncify.state === Asyncify.State.Normal) {
          var reachedCallback = false;
          var reachedAfterCallback = false;
          startAsync((handleSleepReturnValue) => {
            assert(
              !handleSleepReturnValue ||
                typeof handleSleepReturnValue == 'number' ||
                typeof handleSleepReturnValue == 'boolean'
            );
            if (ABORT) return;
            Asyncify.handleSleepReturnValue = handleSleepReturnValue || 0;
            reachedCallback = true;
            if (!reachedAfterCallback) {
              return;
            }
            assert(
              !Asyncify.exportCallStack.length,
              'Waking up (starting to rewind) must be done from JS, without compiled code on the stack.'
            );
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
    var ASSERTIONS = true;
    function checkIncomingModuleAPI() {
      ignoredModuleProp('fetchSettings');
    }
    var asmLibraryArg = {
      __handle_stack_overflow: ___handle_stack_overflow,
      _emscripten_date_now: __emscripten_date_now,
      emscripten_memcpy_big: _emscripten_memcpy_big,
      emscripten_resize_heap: _emscripten_resize_heap,
      environ_get: _environ_get,
      environ_sizes_get: _environ_sizes_get,
      fd_write: _fd_write,
      setTempRet0: _setTempRet0,
    };
    Asyncify.instrumentWasmImports(asmLibraryArg);
    var asm = createWasm();
    var ___wasm_call_ctors = (Module['___wasm_call_ctors'] =
      createExportWrapper('__wasm_call_ctors'));
    var _init = (Module['_init'] = createExportWrapper('init'));
    var _dispose = (Module['_dispose'] = createExportWrapper('dispose'));
    var _getVersion = (Module['_getVersion'] = createExportWrapper('getVersion'));
    var _setErrorCallback = (Module['_setErrorCallback'] = createExportWrapper('setErrorCallback'));
    var _getMainDesc = (Module['_getMainDesc'] = createExportWrapper('getMainDesc'));
    var _isMainDescChanged = (Module['_isMainDescChanged'] =
      createExportWrapper('isMainDescChanged'));
    var _getVarsDesc = (Module['_getVarsDesc'] = createExportWrapper('getVarsDesc'));
    var _isVarsDescChanged = (Module['_isVarsDescChanged'] =
      createExportWrapper('isVarsDescChanged'));
    var _getActions = (Module['_getActions'] = createExportWrapper('getActions'));
    var _malloc = (Module['_malloc'] = createExportWrapper('malloc'));
    var _selectAction = (Module['_selectAction'] = createExportWrapper('selectAction'));
    var _executeSelAction = (Module['_executeSelAction'] = createExportWrapper('executeSelAction'));
    var _isActionsChanged = (Module['_isActionsChanged'] = createExportWrapper('isActionsChanged'));
    var _getObjects = (Module['_getObjects'] = createExportWrapper('getObjects'));
    var _selectObject = (Module['_selectObject'] = createExportWrapper('selectObject'));
    var _isObjectsChanged = (Module['_isObjectsChanged'] = createExportWrapper('isObjectsChanged'));
    var _loadGameData = (Module['_loadGameData'] = createExportWrapper('loadGameData'));
    var _restartGame = (Module['_restartGame'] = createExportWrapper('restartGame'));
    var _saveGameData = (Module['_saveGameData'] = createExportWrapper('saveGameData'));
    var _free = (Module['_free'] = createExportWrapper('free'));
    var _loadSavedGameData = (Module['_loadSavedGameData'] =
      createExportWrapper('loadSavedGameData'));
    var _execString = (Module['_execString'] = createExportWrapper('execString'));
    var _execCounter = (Module['_execCounter'] = createExportWrapper('execCounter'));
    var _execLoc = (Module['_execLoc'] = createExportWrapper('execLoc'));
    var _execUserInput = (Module['_execUserInput'] = createExportWrapper('execUserInput'));
    var _getLastErrorNum = (Module['_getLastErrorNum'] = createExportWrapper('getLastErrorNum'));
    var _getLastErrorLoc = (Module['_getLastErrorLoc'] = createExportWrapper('getLastErrorLoc'));
    var _getLastErrorActIndex = (Module['_getLastErrorActIndex'] =
      createExportWrapper('getLastErrorActIndex'));
    var _getLastErrorLine = (Module['_getLastErrorLine'] = createExportWrapper('getLastErrorLine'));
    var _getErrorDesc = (Module['_getErrorDesc'] = createExportWrapper('getErrorDesc'));
    var _getVarStringValue = (Module['_getVarStringValue'] =
      createExportWrapper('getVarStringValue'));
    var _getVarNumValue = (Module['_getVarNumValue'] = createExportWrapper('getVarNumValue'));
    var _initCallBacks = (Module['_initCallBacks'] = createExportWrapper('initCallBacks'));
    var _setCallBack = (Module['_setCallBack'] = createExportWrapper('setCallBack'));
    var _freeItemsList = (Module['_freeItemsList'] = createExportWrapper('freeItemsList'));
    var _freeSaveBuffer = (Module['_freeSaveBuffer'] = createExportWrapper('freeSaveBuffer'));
    var _fflush = (Module['_fflush'] = createExportWrapper('fflush'));
    var ___errno_location = (Module['___errno_location'] = createExportWrapper('__errno_location'));
    var _setThrew = (Module['_setThrew'] = createExportWrapper('setThrew'));
    var _saveSetjmp = (Module['_saveSetjmp'] = createExportWrapper('saveSetjmp'));
    var _emscripten_stack_init = (Module['_emscripten_stack_init'] = function () {
      return (_emscripten_stack_init = Module['_emscripten_stack_init'] =
        Module['asm']['emscripten_stack_init']).apply(null, arguments);
    });
    var _emscripten_stack_set_limits = (Module['_emscripten_stack_set_limits'] = function () {
      return (_emscripten_stack_set_limits = Module['_emscripten_stack_set_limits'] =
        Module['asm']['emscripten_stack_set_limits']).apply(null, arguments);
    });
    var _emscripten_stack_get_free = (Module['_emscripten_stack_get_free'] = function () {
      return (_emscripten_stack_get_free = Module['_emscripten_stack_get_free'] =
        Module['asm']['emscripten_stack_get_free']).apply(null, arguments);
    });
    var _emscripten_stack_get_base = (Module['_emscripten_stack_get_base'] = function () {
      return (_emscripten_stack_get_base = Module['_emscripten_stack_get_base'] =
        Module['asm']['emscripten_stack_get_base']).apply(null, arguments);
    });
    var _emscripten_stack_get_end = (Module['_emscripten_stack_get_end'] = function () {
      return (_emscripten_stack_get_end = Module['_emscripten_stack_get_end'] =
        Module['asm']['emscripten_stack_get_end']).apply(null, arguments);
    });
    var stackSave = (Module['stackSave'] = createExportWrapper('stackSave'));
    var stackRestore = (Module['stackRestore'] = createExportWrapper('stackRestore'));
    var stackAlloc = (Module['stackAlloc'] = createExportWrapper('stackAlloc'));
    var ___set_stack_limits = (Module['___set_stack_limits'] =
      createExportWrapper('__set_stack_limits'));
    var dynCall_iii = (Module['dynCall_iii'] = createExportWrapper('dynCall_iii'));
    var dynCall_viii = (Module['dynCall_viii'] = createExportWrapper('dynCall_viii'));
    var dynCall_iiiii = (Module['dynCall_iiiii'] = createExportWrapper('dynCall_iiiii'));
    var dynCall_vi = (Module['dynCall_vi'] = createExportWrapper('dynCall_vi'));
    var dynCall_iiii = (Module['dynCall_iiii'] = createExportWrapper('dynCall_iiii'));
    var dynCall_ii = (Module['dynCall_ii'] = createExportWrapper('dynCall_ii'));
    var dynCall_i = (Module['dynCall_i'] = createExportWrapper('dynCall_i'));
    var dynCall_jiji = (Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji'));
    var dynCall_iidiiii = (Module['dynCall_iidiiii'] = createExportWrapper('dynCall_iidiiii'));
    var dynCall_vii = (Module['dynCall_vii'] = createExportWrapper('dynCall_vii'));
    var _asyncify_start_unwind = (Module['_asyncify_start_unwind'] =
      createExportWrapper('asyncify_start_unwind'));
    var _asyncify_stop_unwind = (Module['_asyncify_stop_unwind'] =
      createExportWrapper('asyncify_stop_unwind'));
    var _asyncify_start_rewind = (Module['_asyncify_start_rewind'] =
      createExportWrapper('asyncify_start_rewind'));
    var _asyncify_stop_rewind = (Module['_asyncify_stop_rewind'] =
      createExportWrapper('asyncify_stop_rewind'));
    unexportedRuntimeFunction('ccall', false);
    Module['cwrap'] = cwrap;
    unexportedRuntimeFunction('allocate', false);
    unexportedRuntimeFunction('UTF8ArrayToString', false);
    unexportedRuntimeFunction('UTF8ToString', false);
    unexportedRuntimeFunction('stringToUTF8Array', false);
    unexportedRuntimeFunction('stringToUTF8', false);
    unexportedRuntimeFunction('lengthBytesUTF8', false);
    unexportedRuntimeFunction('addOnPreRun', false);
    unexportedRuntimeFunction('addOnInit', false);
    unexportedRuntimeFunction('addOnPreMain', false);
    unexportedRuntimeFunction('addOnExit', false);
    unexportedRuntimeFunction('addOnPostRun', false);
    unexportedRuntimeFunction('addRunDependency', true);
    unexportedRuntimeFunction('removeRunDependency', true);
    unexportedRuntimeFunction('FS_createFolder', false);
    unexportedRuntimeFunction('FS_createPath', true);
    unexportedRuntimeFunction('FS_createDataFile', true);
    unexportedRuntimeFunction('FS_createPreloadedFile', true);
    unexportedRuntimeFunction('FS_createLazyFile', true);
    unexportedRuntimeFunction('FS_createLink', false);
    unexportedRuntimeFunction('FS_createDevice', true);
    unexportedRuntimeFunction('FS_unlink', true);
    unexportedRuntimeFunction('getLEB', false);
    unexportedRuntimeFunction('getFunctionTables', false);
    unexportedRuntimeFunction('alignFunctionTables', false);
    unexportedRuntimeFunction('registerFunctions', false);
    Module['addFunction'] = addFunction;
    unexportedRuntimeFunction('removeFunction', false);
    unexportedRuntimeFunction('prettyPrint', false);
    unexportedRuntimeFunction('getCompilerSetting', false);
    unexportedRuntimeFunction('print', false);
    unexportedRuntimeFunction('printErr', false);
    unexportedRuntimeFunction('getTempRet0', false);
    unexportedRuntimeFunction('setTempRet0', false);
    unexportedRuntimeFunction('callMain', false);
    unexportedRuntimeFunction('abort', false);
    unexportedRuntimeFunction('keepRuntimeAlive', false);
    unexportedRuntimeFunction('wasmMemory', false);
    unexportedRuntimeFunction('warnOnce', false);
    unexportedRuntimeFunction('stackSave', false);
    unexportedRuntimeFunction('stackRestore', false);
    unexportedRuntimeFunction('stackAlloc', false);
    unexportedRuntimeFunction('AsciiToString', false);
    unexportedRuntimeFunction('stringToAscii', false);
    unexportedRuntimeFunction('UTF16ToString', false);
    unexportedRuntimeFunction('stringToUTF16', false);
    unexportedRuntimeFunction('lengthBytesUTF16', false);
    Module['UTF32ToString'] = UTF32ToString;
    Module['stringToUTF32'] = stringToUTF32;
    Module['lengthBytesUTF32'] = lengthBytesUTF32;
    unexportedRuntimeFunction('allocateUTF8', false);
    unexportedRuntimeFunction('allocateUTF8OnStack', false);
    unexportedRuntimeFunction('ExitStatus', false);
    unexportedRuntimeFunction('intArrayFromString', false);
    unexportedRuntimeFunction('intArrayToString', false);
    unexportedRuntimeFunction('writeStringToMemory', false);
    unexportedRuntimeFunction('writeArrayToMemory', false);
    unexportedRuntimeFunction('writeAsciiToMemory', false);
    Module['writeStackCookie'] = writeStackCookie;
    Module['checkStackCookie'] = checkStackCookie;
    unexportedRuntimeFunction('ptrToString', false);
    unexportedRuntimeFunction('zeroMemory', false);
    unexportedRuntimeFunction('stringToNewUTF8', false);
    unexportedRuntimeFunction('getHeapMax', false);
    unexportedRuntimeFunction('emscripten_realloc_buffer', false);
    unexportedRuntimeFunction('ENV', false);
    unexportedRuntimeFunction('ERRNO_CODES', false);
    unexportedRuntimeFunction('ERRNO_MESSAGES', false);
    unexportedRuntimeFunction('setErrNo', false);
    unexportedRuntimeFunction('inetPton4', false);
    unexportedRuntimeFunction('inetNtop4', false);
    unexportedRuntimeFunction('inetPton6', false);
    unexportedRuntimeFunction('inetNtop6', false);
    unexportedRuntimeFunction('readSockaddr', false);
    unexportedRuntimeFunction('writeSockaddr', false);
    unexportedRuntimeFunction('DNS', false);
    unexportedRuntimeFunction('getHostByName', false);
    unexportedRuntimeFunction('Protocols', false);
    unexportedRuntimeFunction('Sockets', false);
    unexportedRuntimeFunction('getRandomDevice', false);
    unexportedRuntimeFunction('traverseStack', false);
    unexportedRuntimeFunction('UNWIND_CACHE', false);
    unexportedRuntimeFunction('convertPCtoSourceLocation', false);
    unexportedRuntimeFunction('readAsmConstArgsArray', false);
    unexportedRuntimeFunction('readAsmConstArgs', false);
    unexportedRuntimeFunction('mainThreadEM_ASM', false);
    unexportedRuntimeFunction('jstoi_q', false);
    unexportedRuntimeFunction('jstoi_s', false);
    unexportedRuntimeFunction('getExecutableName', false);
    unexportedRuntimeFunction('listenOnce', false);
    unexportedRuntimeFunction('autoResumeAudioContext', false);
    unexportedRuntimeFunction('dynCallLegacy', false);
    unexportedRuntimeFunction('getDynCaller', false);
    unexportedRuntimeFunction('dynCall', false);
    unexportedRuntimeFunction('handleException', false);
    unexportedRuntimeFunction('runtimeKeepalivePush', false);
    unexportedRuntimeFunction('runtimeKeepalivePop', false);
    unexportedRuntimeFunction('callUserCallback', false);
    unexportedRuntimeFunction('maybeExit', false);
    unexportedRuntimeFunction('safeSetTimeout', false);
    unexportedRuntimeFunction('asmjsMangle', false);
    unexportedRuntimeFunction('asyncLoad', false);
    unexportedRuntimeFunction('alignMemory', false);
    unexportedRuntimeFunction('mmapAlloc', false);
    unexportedRuntimeFunction('writeI53ToI64', false);
    unexportedRuntimeFunction('writeI53ToI64Clamped', false);
    unexportedRuntimeFunction('writeI53ToI64Signaling', false);
    unexportedRuntimeFunction('writeI53ToU64Clamped', false);
    unexportedRuntimeFunction('writeI53ToU64Signaling', false);
    unexportedRuntimeFunction('readI53FromI64', false);
    unexportedRuntimeFunction('readI53FromU64', false);
    unexportedRuntimeFunction('convertI32PairToI53', false);
    unexportedRuntimeFunction('convertI32PairToI53Checked', false);
    unexportedRuntimeFunction('convertU32PairToI53', false);
    unexportedRuntimeFunction('reallyNegative', false);
    unexportedRuntimeFunction('unSign', false);
    unexportedRuntimeFunction('strLen', false);
    unexportedRuntimeFunction('reSign', false);
    unexportedRuntimeFunction('formatString', false);
    unexportedRuntimeFunction('setValue', false);
    Module['getValue'] = getValue;
    unexportedRuntimeFunction('PATH', false);
    unexportedRuntimeFunction('PATH_FS', false);
    unexportedRuntimeFunction('SYSCALLS', false);
    unexportedRuntimeFunction('getSocketFromFD', false);
    unexportedRuntimeFunction('getSocketAddress', false);
    unexportedRuntimeFunction('JSEvents', false);
    unexportedRuntimeFunction('registerKeyEventCallback', false);
    unexportedRuntimeFunction('specialHTMLTargets', false);
    unexportedRuntimeFunction('maybeCStringToJsString', false);
    unexportedRuntimeFunction('findEventTarget', false);
    unexportedRuntimeFunction('findCanvasEventTarget', false);
    unexportedRuntimeFunction('getBoundingClientRect', false);
    unexportedRuntimeFunction('fillMouseEventData', false);
    unexportedRuntimeFunction('registerMouseEventCallback', false);
    unexportedRuntimeFunction('registerWheelEventCallback', false);
    unexportedRuntimeFunction('registerUiEventCallback', false);
    unexportedRuntimeFunction('registerFocusEventCallback', false);
    unexportedRuntimeFunction('fillDeviceOrientationEventData', false);
    unexportedRuntimeFunction('registerDeviceOrientationEventCallback', false);
    unexportedRuntimeFunction('fillDeviceMotionEventData', false);
    unexportedRuntimeFunction('registerDeviceMotionEventCallback', false);
    unexportedRuntimeFunction('screenOrientation', false);
    unexportedRuntimeFunction('fillOrientationChangeEventData', false);
    unexportedRuntimeFunction('registerOrientationChangeEventCallback', false);
    unexportedRuntimeFunction('fillFullscreenChangeEventData', false);
    unexportedRuntimeFunction('registerFullscreenChangeEventCallback', false);
    unexportedRuntimeFunction('JSEvents_requestFullscreen', false);
    unexportedRuntimeFunction('JSEvents_resizeCanvasForFullscreen', false);
    unexportedRuntimeFunction('registerRestoreOldStyle', false);
    unexportedRuntimeFunction('hideEverythingExceptGivenElement', false);
    unexportedRuntimeFunction('restoreHiddenElements', false);
    unexportedRuntimeFunction('setLetterbox', false);
    unexportedRuntimeFunction('currentFullscreenStrategy', false);
    unexportedRuntimeFunction('restoreOldWindowedStyle', false);
    unexportedRuntimeFunction('softFullscreenResizeWebGLRenderTarget', false);
    unexportedRuntimeFunction('doRequestFullscreen', false);
    unexportedRuntimeFunction('fillPointerlockChangeEventData', false);
    unexportedRuntimeFunction('registerPointerlockChangeEventCallback', false);
    unexportedRuntimeFunction('registerPointerlockErrorEventCallback', false);
    unexportedRuntimeFunction('requestPointerLock', false);
    unexportedRuntimeFunction('fillVisibilityChangeEventData', false);
    unexportedRuntimeFunction('registerVisibilityChangeEventCallback', false);
    unexportedRuntimeFunction('registerTouchEventCallback', false);
    unexportedRuntimeFunction('fillGamepadEventData', false);
    unexportedRuntimeFunction('registerGamepadEventCallback', false);
    unexportedRuntimeFunction('registerBeforeUnloadEventCallback', false);
    unexportedRuntimeFunction('fillBatteryEventData', false);
    unexportedRuntimeFunction('battery', false);
    unexportedRuntimeFunction('registerBatteryEventCallback', false);
    unexportedRuntimeFunction('setCanvasElementSize', false);
    unexportedRuntimeFunction('getCanvasElementSize', false);
    unexportedRuntimeFunction('demangle', false);
    unexportedRuntimeFunction('demangleAll', false);
    unexportedRuntimeFunction('jsStackTrace', false);
    unexportedRuntimeFunction('stackTrace', false);
    unexportedRuntimeFunction('getEnvStrings', false);
    unexportedRuntimeFunction('checkWasiClock', false);
    unexportedRuntimeFunction('flush_NO_FILESYSTEM', false);
    unexportedRuntimeFunction('dlopenMissingError', false);
    unexportedRuntimeFunction('setImmediateWrapped', false);
    unexportedRuntimeFunction('clearImmediateWrapped', false);
    unexportedRuntimeFunction('polyfillSetImmediate', false);
    unexportedRuntimeFunction('uncaughtExceptionCount', false);
    unexportedRuntimeFunction('exceptionLast', false);
    unexportedRuntimeFunction('exceptionCaught', false);
    unexportedRuntimeFunction('ExceptionInfo', false);
    unexportedRuntimeFunction('exception_addRef', false);
    unexportedRuntimeFunction('exception_decRef', false);
    unexportedRuntimeFunction('Browser', false);
    unexportedRuntimeFunction('setMainLoop', false);
    unexportedRuntimeFunction('wget', false);
    unexportedRuntimeFunction('FS', false);
    unexportedRuntimeFunction('MEMFS', false);
    unexportedRuntimeFunction('TTY', false);
    unexportedRuntimeFunction('PIPEFS', false);
    unexportedRuntimeFunction('SOCKFS', false);
    unexportedRuntimeFunction('_setNetworkCallback', false);
    unexportedRuntimeFunction('tempFixedLengthArray', false);
    unexportedRuntimeFunction('miniTempWebGLFloatBuffers', false);
    unexportedRuntimeFunction('heapObjectForWebGLType', false);
    unexportedRuntimeFunction('heapAccessShiftForWebGLHeap', false);
    unexportedRuntimeFunction('GL', false);
    unexportedRuntimeFunction('emscriptenWebGLGet', false);
    unexportedRuntimeFunction('computeUnpackAlignedImageSize', false);
    unexportedRuntimeFunction('emscriptenWebGLGetTexPixelData', false);
    unexportedRuntimeFunction('emscriptenWebGLGetUniform', false);
    unexportedRuntimeFunction('webglGetUniformLocation', false);
    unexportedRuntimeFunction('webglPrepareUniformLocationsBeforeFirstUse', false);
    unexportedRuntimeFunction('webglGetLeftBracePos', false);
    unexportedRuntimeFunction('emscriptenWebGLGetVertexAttrib', false);
    unexportedRuntimeFunction('writeGLArray', false);
    unexportedRuntimeFunction('AL', false);
    unexportedRuntimeFunction('SDL_unicode', false);
    unexportedRuntimeFunction('SDL_ttfContext', false);
    unexportedRuntimeFunction('SDL_audio', false);
    unexportedRuntimeFunction('SDL', false);
    unexportedRuntimeFunction('SDL_gfx', false);
    unexportedRuntimeFunction('GLUT', false);
    unexportedRuntimeFunction('EGL', false);
    unexportedRuntimeFunction('GLFW_Window', false);
    unexportedRuntimeFunction('GLFW', false);
    unexportedRuntimeFunction('GLEW', false);
    unexportedRuntimeFunction('IDBStore', false);
    unexportedRuntimeFunction('runAndAbortIfError', false);
    Module['Asyncify'] = Asyncify;
    unexportedRuntimeFunction('Fibers', false);
    unexportedRuntimeSymbol('ALLOC_NORMAL', false);
    unexportedRuntimeSymbol('ALLOC_STACK', false);
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
        assert(
          !Module['_main'],
          'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'
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
    Module['run'] = run;
    function checkUnflushedContent() {
      var oldOut = out;
      var oldErr = err;
      var has = false;
      out = err = (x) => {
        has = true;
      };
      try {
        flush_NO_FILESYSTEM();
      } catch (e) {}
      out = oldOut;
      err = oldErr;
      if (has) {
        warnOnce(
          'stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.'
        );
        warnOnce(
          '(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)'
        );
      }
    }
    function procExit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module['onExit']) Module['onExit'](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
      }
    }
    run();

    return Module.ready;
  };
})();
if (typeof exports === 'object' && typeof module === 'object') module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], function () {
    return Module;
  });
else if (typeof exports === 'object') exports['Module'] = Module;
