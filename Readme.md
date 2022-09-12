# QSP wasm engine

QSP code wasm bindings that allow to run QSP engine in browser or on Node.js server.

## Installation

```sh
npm install --save @qsp/wasm-engine
```

## Usage

This library has separate builds for running in browser or on server.
Use
```js
import { initQspEngine } from '@qsp/wasm-engine';
import qspWasmUrl from '@qsp/wasm-engine/qsp-engine.wasm';

const wasm = await fetch(wasmPath).then((r) => r.arrayBuffer());
const api = await init(qspWasmUrl);
```

or 

```js
const { initQspEngine } = require('@qsp/wasm-engine');
const fsp = require('fs/promises');
const wasm = await fsp.readFile(require.resolve('@qsp/wasm-engine/qsp-engine.wasm'));
const api = await initQspEngine(wasm.buffer);

```
depending on your environment.
As first argument you need to pass URL of wasm module in browser (you might need to configure your bundler to handle wasm module as URL) or path to wasm module in node.
`initQspEngine` returns a promise that resolves with API wrapper abstracting away all low level interactions with wasm.

## API

```ts
// subscribing for engine events (see belove)
api.on(event: string, callback: Function): void;
// unsubscribing from engine events
api.off(event: string, callback: Function): void;
// returns current core version
api.version(): string;
// loads game or library code into engine
api.openGame(data: ArrayBuffer, isNewGame: boolean): void;
// returns save data representing current game state
api.saveGame(): ArrayBuffer | null;
// restores game state from save data
api.loadSave(data: ArrayBuffer): void;
// restarts game currently loaded in engine
api.restartGame(): void;
// selects action by index
api.selectAction(index: number): void;
// executes code of currently selected action
api.execSelectedAction(): void;
// selects object by index
api.selectObject(index: number): void;
// updates user input variable
api.updateUserInput(code: string): void;
// executes arbitrary QSP code
api.execCode(code: string): void;
// executes code of $counter location
api.execCounter(): void;
// executes code from some location by name
api.execLoc(name: string): void;
// reads content of some variable by index (0 by default)
api.readVariable(name: string, index?: number): string | number;
// reads content of some variable by string key
api.readVariableByKey(name: string, key: string): string | number;
// reads size of some variable
api.readVariableSize(name: string): number;
// allows to subscribe to variable changes (main intention is to watch UI related variables)
api.watchVariable(
    name: string,
    index: number,
    callback: (value: string | number) => void
  ): () => void;
// allows to subscribe to variable key changes (main intention is to watch UI related variables)
api.watchVariableByKey(
    name: string,
    key: string,
    callback: (value: string | number) => void
  ): () => void;
```

## Engine events

API triggers several events when engine provides updates on current state of game or needs to receive some input from user.

Here is the list of currently supported events.
- `main_changed` - event is triggered whenever text in main panel changes.
  Arguments:
  1. `text` - current content of main panel
- `stats_changed` - event is triggered whenever text in stats panel changes.
  Arguments:
  1. `text` - current content of stats panel
- `actions_changed` - event is triggered whenever list of actions changes.
  Arguments:
  1. `actions` - array of actions (every action has two fields - `name` and `image`)
- `objects_changed` - event is triggered whenever list of objects changes.
  Arguments:
  1. `objects` - array of objects (every object has two fields - `name` and `image`)
- `panel_visibility` - event is triggered whenever one of panels is shown/hidden.
  Arguments:
  1. `type` - code of panel that changed
  1. `isShown` - if panel is shown now
- `user_input` - event is triggered whenever user input is changed (either from game of using `api.updateUserInput`) 
  Arguments:
  1. `text` - current user input
-  `menu` - event is triggered when `MENU` operator is called in game
  Arguments:
  1. `items` - array of menu items (every object has two fields - `name` and `image`)
  1. `callback` - function to be called after user selected some menu item (passing index). `-1` should be passed ff no item has been selected.
- `msg` - event is triggered when `MSG` operator is called in game
  Arguments:
  1. `text` - content of message
  1. `callback` - function to be called when game should resume (pressing ok in MSG dialog)
- `input` - event is triggered when `INPUT` function is called in game
  Arguments:
  1. `text` - content of message
  1. `callback` - function to be called when game should resume (pressing ok in MSG dialog). Text entered by user should be passed as first parameter.
- `wait` - event is triggered when `WAIT` operator is called in game
  Arguments:
  1. `ms` - delay of milliseconds
  1. `callback` - function to be called after delay signaling that game can resume
- `timer` - event is triggered when `SETTIMER` operator is called in game
  Arguments:
  1. `ms` - delay of milliseconds between counter calls
- `view` - event is triggered whenever `VIEW` operator is called in game
  Arguments:
  1. `path` - path to image to be shown (may be empty string)
- `version` - event is triggered when `$QSPVER` function is called in game
  Arguments:
  1. `type` - type of version to be returned (currently `player` or `platform`)
  1. `callback` - function to be called passing needed version data
- `open_game` - event is triggered when `OPENQST` or `INCLIB` operator is called in game
  Arguments:
  1. `path` - path to game file
  1. `isNewGame` - true for `OPENQST` and false for `INCLIB`
  1. `callback` - function to be called after game data was loaded into engine using `api.openGame`
- `save_game` - event is triggered when `SAVEGAME` operator is called in game
  Arguments:
  1. `path` - path where game should be saved (may be empty - it is expected that player asks user to provide this path in such case)
  1. `callback` - function to be called after game state was received using `api.saveGame` and stored at needed path
- `load_save` - event is triggered when `OPENGAME` operator is called in game  
  Arguments:
  1. `path` - path to save (may be empty - it is expected that player asks user to provide this path in such case)
  1. `callback` - function to be called after game state has been loaded using `api.loadSave`
- `is_play` - event is triggered when `ISPLAY` function is called in game
  Arguments:
  1. `path` - path to audio file
  1. `callback` - function to be called with boolean argument indicating whether corresponding audio file is currently playing
- `play_file` - event is triggered when `PLAY` operator is called in game
  Arguments:
  1. `path` - path to audio file
  1. `volume` - current volume (if file is already playing should just change its volume)
  1. `callback` - function to be called when player is ready with changes
- `close_file` - event is triggered when `CLOSE` operator is called in game
  Arguments:
  1. `path` - path to audio file (empty string if `CLOSE ALL` was called)
  1. `callback` - function to be called when player is ready with changes
- `system_cmd` - event is triggered when `EXEC` operator is called in game
  Arguments:
  1. `cmd` - command string (depends on player)
- `error` - event is triggered whenever error has happened while executing QSP code: 
  Arguments:
  1. `errorData` - object containing information about error
