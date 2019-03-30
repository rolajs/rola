const fs = require('fs-extra')
const path = require('path')
const assert = require('assert')
const { transformSync } = require('@babel/core')

const cwd = process.cwd()

function transpile (file, outDir, options = {}) {
  if (outDir) {
    assert(path.isAbsolute(outDir), 'outDir needs to be an absolute path')
  } else {
    outDir = path.join(path.dirname(file), '.rola')
  }

  try {
    const out = path.join(outDir, path.basename(file))

    const { code } = transformSync(fs.readFileSync(file), {
      plugins: [
        require.resolve('@babel/plugin-syntax-object-rest-spread'),
        require.resolve('@babel/plugin-proposal-class-properties'),
        require.resolve('fast-async'),
        [require.resolve('babel-plugin-module-resolver'), {
          alias: {
            '@': cwd,
            ...(options.alias || {})
          }
        }]
      ],
      presets: [
        require.resolve('@babel/preset-env'),
        require.resolve('@babel/preset-react')
      ]
    })

    fs.outputFileSync(out, code)

    const mod = require(out)

    return mod
  } catch (e) {
    return {}
  }
}

module.exports = function getConfig () {
  const out = path.join(cwd, '.rola')
  const conf = path.join(cwd, 'rola.config.js')
  const plug = path.join(cwd, 'rola.plugins.js')

  let config = {
    env: {},
    alias: {},
    presets: []
  }

  if (fs.existsSync(conf)) {
    const mod = transpile(conf, out)
    config = mod.default || mod
  }

  let plugins = []

  if (fs.existsSync(plug)) {
    const mod = transpile(plug, out, { alias: config.alias })
    plugins = mod.default || mod
  } else {
    fs.outputFileSync(path.join(out, 'rola.plugins.js'), `module.exports = []`)
  }

  return {
    ...config,
    plugins
  }
}
