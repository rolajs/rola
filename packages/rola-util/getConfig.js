const path = require('path')
const compiler = require('@rola/compiler')
const log = require('@rola/log')
const node = require('@rola/plugin-node')

module.exports = async function getConfig () {
  const cwd = process.cwd()

  try {
    const configfile = path.resolve(cwd, './rola.config.js')

    if (!configfile) return {}

    const app = compiler({
      in: configfile,
      out: {
        path: path.resolve(cwd, '.cache'),
        filename: 'rola.config.js',
        libraryTarget: 'commonjs2'
      },
      plugins: [
        node()
      ]
    })

    app.on('error', e => log(state => ({ error: state.error.concat(e) })))
    app.on('warn', e => log(state => ({ warn: state.warn.concat(e) })))

    await app.build()

    return require(path.resolve(cwd, '.cache/rola.config.js')).default
  } catch (e) {
    log(state => ({ error: state.error.concat(e) }))
    return {}
  }
}
