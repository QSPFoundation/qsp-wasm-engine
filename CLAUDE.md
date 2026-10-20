# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@qsp/wasm-engine`, a WebAssembly wrapper for the QSP (Quest Soft Player) engine that enables running QSP interactive fiction games in browsers and Node.js environments. The project compiles QSP's C code to WebAssembly and provides TypeScript bindings with a high-level API.

## Development Commands

### Building
- `pnpm run build` - Build the library (cleans dist/, runs Rollup to generate CJS and ES modules, copies WASM files)
- `pnpm run prebuild` - Clean the dist directory (automatically run before build)

### Testing
- `pnpm test` - Run all tests once
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:debug` - Run tests with debug mode enabled

### Code Quality
- `pnpm run lint` - Run ESLint
- `pnpm run check-types` - Run TypeScript type checking without emitting files

### Engine Update
- `pnpm run update-engine [path/to/qsp/sources]` - Build the QSP wasm module in the Emscripten Docker image and replace `src/qsplib/public/`; without a path the engine is cloned from GitHub at the engine commit pinned in `compile-wasm.sh` (`QSP_REF` overrides it with another branch/tag/commit)
- Requires Docker to be running; without Docker run `./compile-wasm.sh` directly (requires the Emscripten SDK installed locally)
- The package is built in the QSP engine repository (`build_release_wasm.sh`, binding sources in `qsp/bindings/wasm/`)

### Publishing
- `pnpm run release` - Release new version using `np` package

## Architecture

### Core Structure
- **`src/index.ts`** - Main entry point, exports all public APIs
- **`src/index-debug.ts`** - Debug build entry point
- **`src/lib/qsp-api.ts`** - Main API implementation (`QspAPIImpl` class)
- **`src/lib/qsp-engine.ts`** - Production WASM engine loader
- **`src/lib/qsp-engine-debug.ts`** - Debug WASM engine loader

### Contracts (TypeScript Interfaces)
- **`src/contracts/api.ts`** - Main API interface definitions
- **`src/contracts/events.ts`** - Event system types
- **`src/contracts/common.ts`** - Common types and enums

### WASM Integration
- **`src/qsplib/public/`** - The `wasm` install component of the QSP engine: generated WASM modules, their typings and the JS half of the binding (`qsp-wasm-module.ts`, `qsp-wasm-memory.ts`), maintained in the QSP engine repository

### Build Output
The project generates multiple build artifacts:
- `dist/wasm-engine.cjs` - CommonJS build
- `dist/wasm-engine.modern.js` - ES modules build
- `dist/wasm-engine-debug.cjs` - Debug CommonJS build
- `dist/wasm-engine-debug.modern.js` - Debug ES modules build
- `dist/qsp-engine.wasm` - Production WASM binary
- `dist/qsp-engine-debug.wasm` - Debug WASM binary

### Testing Structure
- Tests use Vitest framework
- **`src/test-helpers.ts`** - Shared test utilities and setup
- **`tests/`** - Test files covering API functionality, variables, graphics, expressions, etc.
- Tests use the debug WASM build for better error reporting

## Development Workflow

1. **Making changes to TypeScript code**: Edit files in `src/`, run `pnpm run build` to generate new dist files
2. **Updating the engine**: run `pnpm run update-engine` (or `pnpm run update-engine <path>` for a local engine checkout), run the tests, then `pnpm run build`
3. **Testing changes**: Run `pnpm test` or `pnpm run test:watch` for continuous testing
4. **Code quality**: Always run `pnpm run lint` and `pnpm run check-types` before committing

## Key Design Patterns

### Event-Driven API
The engine uses an event system where the WASM module emits events (like `main_changed`, `actions_changed`, `error`) that the TypeScript wrapper handles and forwards to user code.

Blocking events (`msg`, `input`, `menu`, `wait`, `version`, `is_play`, `play_file`, `close_file`, `open_game`, `load_save`, `save_game`, `debug`) pass a `resolve` callback. Without a listener the engine isn't suspended and gets the default answer (nothing, an empty string, `false`, menu index -1), like the default binding without a callback. Calling it synchronously continues the engine in place; calling it later suspends the engine (Asyncify) until then. Only the outermost pending event can suspend: a `resolve` deferred from a nested call (a listener calling the API, an API call made while another one is suspended) is ignored with a console error. The API calls that execute game code return promises that resolve when the engine finishes them (so after any pending event); their errors are reported through the `error` event. `api.dispose()` terminates the engine and frees the memory held by the API.

### Variable Cache
`readVariable*(name, ..., useCache)` reads a value from the engine once and keeps it until the engine runs code: the cache is cleared when a call that executes code starts and ends (`exec`) and whenever an event is emitted (`emit`), the only moments the engine state can change. The watchers read with the cache, so watchers of the same variable share one read per update. `clearCache()` drops the values by hand. The cache lives in the wrapper (`qsp-api.ts`), not in the binding.

### Memory Management
The JS side allocates and frees the memory the engine writes to: lists (actions, objects, location data) go to one reusable `ListBuffer` that grows when a list doesn't fit (the export returns the count, the call is repeated with a bigger buffer), the save goes to a buffer that is grown the same way, strings, variants & error data go to slots/buffers allocated per call. `calculateStringExpression` writes to a buffer of 32K characters (64 KB) and cuts a longer result: it can't be retried, because the expression has side effects. The engine allocates nothing the JS side has to free. The answers of the host (`input`, `version`) are written to a 511-character buffer allocated by the engine (longer answers are cut), the engine frees it. The helpers are in `src/qsplib/public/qsp-wasm-memory.ts`. `api.dispose()` frees everything the API holds.

### Dual Build System
The project maintains both production and debug builds of the WASM module, with the debug version providing enhanced error reporting and debugging capabilities.

### Variable Watching
The API includes a sophisticated variable watching system that allows monitoring QSP game variables for changes, with automatic cleanup of watchers.