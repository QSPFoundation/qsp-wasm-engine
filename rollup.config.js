import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'
import terser from '@rollup/plugin-terser';

export default {
  input: {
    "wasm-engine": "src/index.ts",
    "wasm-engine-debug": "src/index-debug.ts",
  },
  output: [
    {
      dir: 'dist',
      entryFileNames: '[name].cjs',
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
      exclude: ['**/*.test.ts', '**/test-helpers.ts'],
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
}