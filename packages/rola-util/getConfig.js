const path = require('path')
const compiler = require('@rola/compiler')
const log = require('@rola/log')

module.exports = async function getConfig () {
  const cwd = process.cwd()
  const configfile = path.resolve(cwd, './rola.config.js')

  await compiler({
    in: configfile,
    out: {
      path: path.resolve(cwd, '.cache'),
      filename: 'rola.config.js',
      libraryTarget: 'commonjs2'
    }
  }).build()

  try {
    return require(path.resolve(cwd, '.cache/rola.config.js')).default
  } catch (e) {
    log(state => ({ error: state.error.concat(e) }))
    return config
  }
}
