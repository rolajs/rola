const c = require('ansi-colors')
const output = require('log-update')
const pkg = require('../package.json')

const store = require('picostate')({
  msg: null,
  compiling: false,
  stats: [],
  static: [],
  server: false,
  refreshing: false,
  error: false
})

function compiler (active, stats, compiling) {
}

function log (state) {
  output(state.error ? `
  ${c.bgRed(` hypr `)} v${pkg.version}

  ${state.error}
` : `
  ${c.bgBlue(` hypr `)} v${pkg.version}
  ${state.msg ? '\n  ' + state.msg + '\n' : ''}${state.server ? `\n  open ${c.green(state.server)}\n` : ''}
  ${state.stats.map((stats, i) => {
    return stats.assets
      .filter(asset => !/\.map$/.test(asset.name))
      .map(asset => {
        return `${asset.name.padEnd(12)} ${c.gray(asset.size + 'kb')}`
      }).join('\n  ')
  }).join('\n  ')}
  ${state.static.length ? `
  ${state.static.map(file => `${file.padEnd(12)} ${c.gray('static')}`).join('\n  ')}
` : ''}
`)
}

store.listen(log)

store.hydrate({
  msg: 'initializing...'
})()

module.exports = state => store.hydrate(state)()
