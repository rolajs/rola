/**
 * unused
 */
const fs = require('fs-extra')
const path = require('path')
const assert = require('assert')
const { transformSync } = require('@babel/core')

module.exports = function transpile (file, options = {}) {
  const { code } = transformSync(fs.readFileSync(file), {
    plugins: [
      require.resolve('@babel/plugin-syntax-object-rest-spread'),
      require.resolve('@babel/plugin-proposal-class-properties'),
      require.resolve('fast-async'),
      [require.resolve('babel-plugin-module-resolver'), {
        alias: {
          '@': process.cwd(),
          ...(options.alias || {})
        }
      }]
    ],
    presets: [
      require.resolve('@babel/preset-env'),
      require.resolve('@babel/preset-react')
    ]
  })

  return code
}
