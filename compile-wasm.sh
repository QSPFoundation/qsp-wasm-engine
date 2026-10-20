#!/bin/sh

# Builds the QSP wasm module and installs it into src/qsplib/public
# Usage: ./compile-wasm.sh [path/to/qsp/sources]
# Without a path the sources are cloned from GitHub (QSP_REF selects a branch, tag or commit)
set -e

QSP_REF="${QSP_REF:-24f1d488908be572fe098fdb6db87bab648d2e6b}" # engine commit used by this version
BUILD_DIR="$(pwd)/src/qsplib/build"
TARGET="$(pwd)/src/qsplib/public"

if [ -n "$1" ]; then
  QSP_SRC="$(cd "$1" && pwd)"
else
  QSP_SRC="$BUILD_DIR/qsp"
  rm -rf "$QSP_SRC"
  git clone --quiet https://github.com/QSPFoundation/qsp "$QSP_SRC"
  git -C "$QSP_SRC" checkout --quiet "$QSP_REF"
fi

# The CMake cache is bound to the source directory
grep -qs "^CMAKE_HOME_DIRECTORY:INTERNAL=$QSP_SRC$" "$BUILD_DIR/wasm/CMakeCache.txt" || rm -rf "$BUILD_DIR/wasm"

emcmake cmake -S "$QSP_SRC" -B "$BUILD_DIR/wasm" \
  -DBUILD_STATIC=ON \
  -DBUILD_WASM=ON \
  -DCMAKE_BUILD_TYPE=Release

cmake --build "$BUILD_DIR/wasm" --parallel "$(nproc)"

rm -rf "$TARGET"
cmake --install "$BUILD_DIR/wasm" --component wasm --prefix "$TARGET"
ls "$TARGET"
