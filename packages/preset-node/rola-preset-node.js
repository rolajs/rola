const webpack = require('webpack')

module.exports = (options = {}) => {
  return {
    createConfig ({ config, context }) {
      config.target = 'node'

      config.node = Object.assign({
        console: false,
        global: true,
        process: true,
        __filename: 'mock',
        __dirname: 'mock',
        Buffer: true,
        setImmediate: true
      }, options)

      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `require('source-map-support').install({ hookRequire: true });`,
          raw: true,
          entryOnly: true,
          exclude: /\.(sa|sc|c)ss$/
        })
      )

      config.devtool = 'inline-source-map'

      return config
    }
  }
}
