cmake_minimum_required(VERSION 3.13)
project (qsplib-wasm VERSION 1.0.0)

set(CMAKE_BUILD_TYPE Release)
set(BUILD_TEST OFF CACHE BOOL "")

configure_file(CMakeLists-qsp.txt.in qsp-download/CMakeLists.txt)
execute_process(COMMAND "${CMAKE_COMMAND}" -G "${CMAKE_GENERATOR}" . WORKING_DIRECTORY "${CMAKE_BINARY_DIR}/qsp-download")
execute_process(COMMAND "${CMAKE_COMMAND}" --build .
		WORKING_DIRECTORY "${CMAKE_BINARY_DIR}/qsp-download"
)

add_subdirectory("${CMAKE_BINARY_DIR}/qsp-src"
					"${CMAKE_BINARY_DIR}/qsp-build"
)

file(GLOB SOURCES src/*.c)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/public")

add_executable(qsp-engine ${SOURCES})
target_include_directories(qsp-engine PRIVATE "${CMAKE_BINARY_DIR}/qsp-src" "${CMAKE_BINARY_DIR}/oniguruma-src" "${CMAKE_BINARY_DIR}/qsp-build")
target_link_libraries(qsp-engine PRIVATE qsp onig)

set_target_properties(qsp-engine PROPERTIES LINK_FLAGS "-Wno-parentheses \
    -Wno-empty-body \
    -Wno-unsequenced \
    -Wcast-align \
    -Wover-aligned \
    -O3 \
    -s EXPORT_ES6=1 \
    -s WASM=1 \
    -s RESERVED_FUNCTION_POINTERS=20 \
    -s ASYNCIFY \
    -s EXPORTED_RUNTIME_METHODS='[addFunction, Asyncify]' \
    -s EXPORTED_FUNCTIONS='[_malloc, _free]' \
    -s ENVIRONMENT='web,worker,webview,node' \
    -s STACK_SIZE=5242880 \
    -s ASYNCIFY_STACK_SIZE=16384 \
    -s MODULARIZE=1 \
    -s INVOKE_RUN=0 \
    -s WARN_UNALIGNED=1 \
    -s STACK_OVERFLOW_CHECK=2 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s FILESYSTEM=0 \
    -s EXPORT_NAME=createQspModule \
    -s DYNAMIC_EXECUTION=0")