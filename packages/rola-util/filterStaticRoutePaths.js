/**
 * unused
 */
const path = require('path')
const assert = require('assert')
const match = require('matched')

const transpile = require('./lib/transpile.js')
const transpileAndGetModule = require('./lib/transpileAndGetModule.js')

module.exports = function filterStaticRoutePaths (glob) {
  assert(path.isAbsolute(glob), 'glob must be absolute path')

  const { alias } = transpileAndGetModule(path.join(process.cwd(), 'rola.config.js'), null, { quiet: true })

  const paths = match.sync(glob)

  return paths.filter(p => {
    try {
      const code = transpile(p, { alias })
      return /exports\.config\s=\s\w+/.test(code)
    } catch (e) {
      return false
    }
  })
}
