#!/bin/sh

# Builds the QSP wasm module in the Emscripten Docker image and updates src/qsplib/public
# Usage: ./update-engine.sh [path/to/qsp/sources]
set -e

IMAGE=emscripten/emsdk:6.0.12

if [ -n "$1" ]; then
  QSP_SRC="$(cd "$1" && pwd)"
fi

tty -s && TTY_ARGS="-ti" || TTY_ARGS=""

docker run --rm \
  -v "$(pwd)":/work \
  -w /work \
  ${QSP_SRC:+-v "$QSP_SRC":/qsp:ro} \
  $TTY_ARGS \
  -e QSP_REF \
  -u "$(id -u):$(id -g)" \
  $IMAGE ./compile-wasm.sh ${QSP_SRC:+/qsp}
