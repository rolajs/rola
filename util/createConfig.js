const path = require('path')

const cwd = process.cwd()

module.exports = function createConfig ({ entry, watch, env, alias, banner }) {
  const node = /server/.test(entry)

  return {
    in: entry,
    out: node ? {
      path: path.join(cwd, 'static'),
      libraryTarget: 'commonjs2'
    } : path.join(cwd, 'static'),
    env: env || {},
    alias: alias || {},
    node,
    banner: node ? (
      `require('source-map-support').install();`
    ) : (
      '/** built with hypr */'
    ) + banner || ''
  }
}
