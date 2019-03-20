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

      return config
    }
  }
}
