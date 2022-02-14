import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import { babel } from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import server from 'rollup-plugin-serve'
import replace from 'rollup-plugin-replace'
import vue from 'rollup-plugin-vue'
import eslint from '@rollup/plugin-eslint'
import alias from '@rollup/plugin-alias'
import livereload from 'rollup-plugin-livereload'
import prettier from 'rollup-plugin-prettier'
import styles from 'rollup-plugin-styles'
import json from '@rollup/plugin-json'
import dts from 'dts-bundle'
import path from 'path'
import pkg from './package.json'

const plugins = [
  commonjs(),
  resolve({ jsnext: true, browser: true }),
  typescript({ useTsconfigDeclarationDir: true }),
  styles(),
  json(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'runtime',
    extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts'],
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage',
          corejs: '3',
        },
      ],
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          absoluteRuntime: false,
          corejs: true,
          helpers: true,
          regenerator: true,
          useESModules: true,
          corejs: '3',
        },
      ],
    ],
  }),
]

const isProd = process.env.NODE_ENV === 'production'

const outPath = 'dist'
const cwd = process.cwd()

function getFileName(base) {
  const pathes = base.split('.')
  pathes.splice(1, 0, `v${pkg.version}`)
  return pathes.join('.')
}

const bundles = [
  {
    input: 'src/index.ts',
    output: {
      file: getFileName(pkg.main),
      format: 'cjs',
    },
    plugins: [
      ...plugins,
      {
        name: 'generate-types',
        writeBundle() {
          dts.bundle({
            main: 'src/types/types.d.ts', // 入口地址
            name: pkg.name, // 声明模块
            out: path.join(cwd, outPath, 'types.d.ts'), // 合并后输出地址
          })
        },
      },
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: getFileName(pkg.browser),
      format: 'umd',
      name: 'mySDK',
    },
    plugins: [...plugins],
  },
  {
    input: 'src/index.ts',
    output: {
      file: getFileName(pkg.browser.replace('.js', '.min.js')),
      format: 'umd',
      name: 'mySDK',
    },
    plugins: [
      ...plugins,
      terser({
        compress: {
          pure_funcs: ['console.log'],
        },
        output: {
          comments: false,
        },
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: getFileName(pkg.module),
      format: 'es',
    },
    plugins: [...plugins],
  },
]

let port = 8080

function getDevConfig(basePath, plugin = []) {
  const dest = `${outPath}/${basePath}`
  return {
    input: `examples/${basePath}/index.ts`,
    output: {
      file: `${dest}/index.js`,
      format: 'iife',
    },
    plugins: [
      eslint(),
      vue(),
      prettier({
        parser: 'babel',
      }),
      ...plugins,
      server({
        port: port++,
        contentBase: [outPath, dest],
        host: '0.0.0.0',
        historyApiFallback: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      copy({
        targets: [
          {
            src: 'examples/index.html',
            dest,
            transform: (content) =>
              content
                .toString()
                .replace('__MODULE__', getFileName(pkg.browser.replace(`${outPath}/`, ''))),
          },
          {
            src: `examples/${basePath}/images`,
            dest,
          },
        ],
      }),
      alias({
        entries: {
          vue: 'node_modules/vue/dist/vue.runtime.esm-browser.js',
        },
      }),
      ...plugin,
    ],
  }
}

export default isProd ? bundles : [bundles[1], getDevConfig('main-app', [livereload()])]
