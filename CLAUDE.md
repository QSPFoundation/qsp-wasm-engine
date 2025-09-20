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

### WASM Compilation
- `pnpm run compile` - Compile C code to WASM using Docker with Emscripten SDK
- Requires Docker to be running
- Uses `./compile-wasm.sh` script inside Emscripten container
- **Alternative**: If Docker is not available, run `./compile-wasm.sh` directly (requires Emscripten SDK installed locally)

### Publishing
- `pnpm run release` - Release new version using `np` package

## Architecture

### Core Structure
- **`src/index.ts`** - Main entry point, exports all public APIs
- **`src/index-debug.ts`** - Debug build entry point
- **`src/lib/qsp-api.ts`** - Main API implementation (`QspAPIImpl` class)
- **`src/lib/qsp-engine.ts`** - Production WASM engine loader
- **`src/lib/qsp-engine-debug.ts`** - Debug WASM engine loader
- **`src/lib/pointers.ts`** - Low-level WASM memory management utilities

### Contracts (TypeScript Interfaces)
- **`src/contracts/api.ts`** - Main API interface definitions
- **`src/contracts/events.ts`** - Event system types
- **`src/contracts/common.ts`** - Common types and enums
- **`src/contracts/wasm-module.ts`** - WASM module interface definitions

### WASM Integration
- **`src/qsplib/`** - Contains C source code and build configuration
- **`src/qsplib/src/qsp_wasm.c`** - C wrapper code for WASM interface
- **`src/qsplib/CMakeLists.txt`** - CMake build configuration for WASM compilation
- **`src/qsplib/public/`** - Generated WASM files and TypeScript definitions

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
2. **Making changes to C code**: Edit files in `src/qsplib/src/`, run `pnpm run compile` to regenerate WASM, then `pnpm run build`
3. **Testing changes**: Run `pnpm test` or `pnpm run test:watch` for continuous testing
4. **Code quality**: Always run `pnpm run lint` and `pnpm run check-types` before committing

## Key Design Patterns

### Event-Driven API
The engine uses an event system where the WASM module emits events (like `main_changed`, `actions_changed`, `error`) that the TypeScript wrapper handles and forwards to user code.

### Memory Management
The `pointers.ts` module provides utilities for safe interaction with WASM memory, including automatic cleanup of allocated strings and buffers.

### Dual Build System
The project maintains both production and debug builds of the WASM module, with the debug version providing enhanced error reporting and debugging capabilities.

### Variable Watching
The API includes a sophisticated variable watching system that allows monitoring QSP game variables for changes, with automatic cleanup of watchers.