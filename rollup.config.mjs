import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'extension/index.js',
    output: {
      dir: 'dist/extension',
      format: 'iife',
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs(),
      copy({
        targets: [
          {
            src: ['manifest.json', 'background.js', 'extension', 'images'],
            dest: 'dist'
          }
        ]
      })
    ]
  }
];
