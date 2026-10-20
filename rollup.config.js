import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

const input = {
  "wasm-engine": "src/index.ts",
  "wasm-engine-debug": "src/index-debug.ts",
};

export default [
  {
    input,
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name]-[hash].cjs', // .js would be loaded as ESM ("type": "module")
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: 'dist',
        entryFileNames: '[name].modern.js',
        format: 'es',
        sourcemap: true,
      },
    ],

    plugins: [
      nodeResolve(),
      typescript({
        rootDir: 'src',
        exclude: ['**/*.test.ts', '**/test-helpers.ts'],
        declaration: false, // the typings are bundled by the config below
        declarationDir: undefined,
      }),
      terser(),
      copy({
        targets: [
          { src: 'src/qsplib/public/qsp-engine-debug.wasm', dest: 'dist' },
          { src: 'src/qsplib/public/qsp-engine-debug.wasm.map', dest: 'dist' },
          { src: 'src/qsplib/public/qsp-engine.wasm', dest: 'dist' },
        ]
      })
    ],
  },
  {
    // Typings bundled per entry (plus a shared chunk): the emitted ones import each other without extensions,
    // which "moduleResolution": "node16"/"nodenext" can't resolve in a "type": "module" package
    input,
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].d.ts',
        chunkFileNames: '[name]-[hash].d.ts',
        format: 'es',
      },
      {
        // .d.ts in a "type": "module" package types an ES module, the CJS build needs its own copy
        dir: 'dist',
        entryFileNames: '[name].d.cts',
        chunkFileNames: '[name]-[hash].d.cts',
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
]
