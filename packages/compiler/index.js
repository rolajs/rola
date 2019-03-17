const path = require('path')
const exit = require('exit')
const onExit = require('exit-hook')
const webpack = require('webpack')

const { createConfig } = require('./lib/config.js')
const { formatStats } = require('./lib/stats.js')
const clientReloader = require('./lib/clientReloader.js')
const { on, emit } = require('./lib/emitter.js')

const cwd = process.cwd()

function watch (confs) {
  let port = 4000
  const servers = {}
  const sockets = {}

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

  const compiler = webpack(configs).watch({}, (e, stats) => {
    if (e) return emit('error', e)

    const formatted = formatStats(stats)

    formatted.map(stats => {
      const hash = stats.assets
        .filter(asset => /\.js$/.test(asset.name))
        .map(asset => path.basename(asset.name, '.js'))
        .join(':')

      if (sockets[hash]) {
        sockets[hash].emit('refresh')
      }
    })

    emit('stats', formatted)
  })

  function closeServer () {
    for (let hash in servers) {
      servers[hash].close()
      sockets[hash].close()
    }

    emit('close')
  }

  onExit(closeServer)

  return {
    close () {
      return new Promise(r => {
        compiler.close(() => {
          closeServer()
          r()
        })
      })
    }
  }
}

function build (confs) {
  const configs = confs
    .map(conf => createConfig(conf, false))
    .map(([ conf, wc ]) => {
      wc.mode = 'production'

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

      emit('stats', formatted)
      emit('done', formatted)
      res(formatted)
    })
  })
}

module.exports = confs => {
  confs = [].concat(confs)

  return {
    on,
    build () {
      emit('build')
      return build(confs)
    },
    watch () {
      emit('watch')
      return watch(confs)
    }
  }
}
