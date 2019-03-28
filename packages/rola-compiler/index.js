const path = require('path')
const exit = require('exit')
const webpack = require('webpack')

const { createConfig } = require('./lib/createConfig.js')
const { formatStats } = require('./lib/stats.js')
const clientReloader = require('./lib/clientReloader.js')

const cwd = process.cwd()

module.exports = confs => {
  const { on, emit } = require('./lib/emitter.js')()

  confs = [].concat(confs)

  let compiler
  const servers = {}
  const sockets = {}

  function closeServer () {
    for (let hash in servers) {
      servers[hash].close()
      sockets[hash].close()
    }

    emit('close')
  }

  return {
    on,
    close () {
      closeServer()
      return Promise.resolve(compiler ? new Promise(r => compiler.close(r)) : null)
    },
    build (options = {}) {
      emit('build')

      const configs = confs
        .map(conf => createConfig(conf, false))
        .map(([ conf, wc ]) => {
          wc.mode = 'production'

          if (options.minify === false) {
            wc.optimization = {
              ...(wc.optimization || {}),
              minimize: false
            }
          }

          process.env.DEBUG && console.log(JSON.stringify(wc, null, '  '))

          return wc
        })

      return new Promise((res, rej) => {
        webpack(configs).run((e, stats) => {
          if (e) {
            emit('error', e)
            rej(e)
            return
          }

          const formatted = formatStats(stats)

          formatted.map(({ errors, warnings }) => {
            if (errors && errors.length) emit('error', errors)
            if (warnings && warnings.length) emit('warn', warnings)
          })

          emit('stats', formatted)
          emit('done', formatted)
          res(formatted)
        })
      })
    },
    watch (options = {}) {
      emit('watch')

      let port = 4000

      const configs = confs
        .map(conf => {
          if (conf.reload) {
            conf.__port = port++
            conf.banner = conf.banner || ''
            conf.banner += clientReloader(conf.__port)
          }

          return conf
        })
        .map(conf => createConfig(conf, true))
        .map(([ conf, wc ]) => {
          const hash = Object.keys(wc.entry).join(':')

          if (conf.reload) {
            servers[hash] = require('http').createServer((req, res) => {
              res.writeHead(200, { 'Content-Type': 'text/plain' })
              res.write('socket running...')
              res.end()
            }).listen(conf.__port)

            sockets[hash] = require('socket.io')(servers[hash], {
              serveClient: false
            })
          }

          process.env.DEBUG && console.log(JSON.stringify(wc, null, '  '))

          return wc
        })

      compiler = webpack(configs).watch(options, (e, stats) => {
        if (e) return emit('error', e)

        const formatted = formatStats(stats)

        formatted.map(({ assets, errors, warnings }) => {
          if (errors && errors.length) emit('error', errors)
          if (warnings && warnings.length) emit('warn', warnings)

          const hash = assets
            .filter(asset => /\.js$/.test(asset.name))
            .map(asset => path.basename(asset.name, '.js'))
            .join(':')

          if (sockets[hash]) {
            sockets[hash].emit('refresh')
          }
        })

        emit('stats', formatted)
      })
    }
  }
}
