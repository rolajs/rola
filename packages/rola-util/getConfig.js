const fs = require('fs-extra')
const path = require('path')
const { transformSync } = require('@babel/core')

module.exports = async function getConfig () {
  const cwd = process.cwd()

  const configs = {
    config: {},
    plugins: []
  }

  try {
    const configIn = path.resolve(cwd, './rola.config.js')
    const configOut = path.join(cwd, '.cache', 'rola.config.js')
    const pluginsIn = path.resolve(cwd, './rola.plugins.js')
    const pluginsOut = path.join(cwd, '.cache', 'rola.plugins.js')

    if (configIn) {
      const { code } = transformSync(fs.readFileSync(configIn), {
        plugins: [
          require.resolve('@babel/plugin-syntax-object-rest-spread'),
          require.resolve('@babel/plugin-proposal-class-properties'),
          require.resolve('fast-async')
        ],
        presets: [
          require.resolve('@babel/preset-env'),
          require.resolve('@babel/preset-react')
        ]
      })

      fs.outputFileSync(configOut, code)

      configs.config = require(configOut).default
    }

    if (pluginsIn) {
      const { code } = transformSync(fs.readFileSync(pluginsIn), {
        plugins: [
          require.resolve('@babel/plugin-syntax-object-rest-spread'),
          require.resolve('@babel/plugin-proposal-class-properties'),
          require.resolve('fast-async')
        ],
        presets: [
          require.resolve('@babel/preset-env'),
          require.resolve('@babel/preset-react')
        ]
      })

      fs.outputFileSync(pluginsOut, code)

      configs.plugins = require(pluginsOut).default
    }
  } catch (e) {
    console.error(e)
    return configs
  }

  return configs
}
