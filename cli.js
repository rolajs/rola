#! /usr/bin/env node
'use strict'

const fs = require('fs-extra')
const path = require('path')
const http = require('http')
const exit = require('exit')
const onExit = require('exit-hook')
const write = require('log-update')

const spitball = require('spitball')
const biti = require('biti')

const pkg = require('./package.json')
const log = require('./lib/logger.js')('hypr')
const App = require('./dist/App.js')
const html = require('./dist/html.js')

const PORT = process.env.PORT || 3002
const cwd = process.cwd()
const prog = require('commander')
  .version(pkg.version)
  .option('-c, --config <path>', 'specify the path to your config file')

const configpath = path.join(cwd, prog.config || 'hypr.config.js')
const config = fs.existsSync(configpath) ? require(configpath) : {}

function logAssets ({ duration, assets }, opts = {}) {
  log.info('built', `in ${duration}ms\n${assets.reduce((_, asset, i) => {
    const size = opts.gzip && asset.size.gzip ? asset.size.gzip + 'kb gzipped' : asset.size.raw + 'kb'
    return _ += `  > ${log.colors.gray(asset.filename)} ${size}${i !== assets.length - 1 ? `\n` : ''}`
  }, '')}`, opts.persist)
}

function createServer (file) {
  let active = false
  return {
    server: null,
    app: null,
    get active () {
      return active
    },
    update () {
      delete require.cache[file]
      this.app = require(file).default
    },
    init () {
      this.app = require(file).default

      this.server = http.createServer(
        require('connect')()
          .use(require('compression')())
          .use(require('serve-static')(path.join(cwd, 'static')))
          .use((req, res, next) => {
            this.app(req, res)
          })
      )

      this.server.listen(PORT, e => {
        if (e) console.error(e)
        log.info('open', log.colors.green(PORT))
        active = true
      })
    },
    close () {
      this.server && this.server.close()
    }
  }
}

const generator = biti({
  env: config.env,
  alias: config.alias,
  filter (routes) {
    return routes.filter(r => !!r.config)
  },
  wrap: App,
  html (props) {
    return (config.html || html)(props)
  }
})

generator.on('render', p => log.info('static', p))
generator.on('error', e => log.error(e.message || e))

function buildCallback (arr) {
  log.info('compiled')
  // arr.map(a => console.log(JSON.stringify(a.assets)))
}

prog
  .command('build')
  .action(() => {
    log.info('building...')

    const time = Date.now()

    generator.on('done', p => log.info('static complete'))

    spitball(
      ['client.js', 'server.js'].reduce((configs, entry) => {
        return configs.concat({
          in: path.join(cwd, entry),
          out: path.join(cwd, 'static'),
          env: config.env || {},
          alias: config.alias || {},
          node: entry === 'server.js',
          banner: ''
        })
      }, [])
    )
      .build()
      .then(stats => {
        buildCallback(stats)
        generator.render('/routes', '/static').then(() => {
          log.info('built', `in ${(Date.now() - time) / 1000}s`)
        })
      })
      .catch(e => {
        log.error(e.message)
      })
  })

prog
  .command('watch')
  .action(() => {
    log.info('watching...')

    let server

    generator.watch('/routes', '/static')

    spitball(
      ['client.js', 'server.js'].reduce((configs, entry) => {
        const node = entry === 'server.js'

        return configs.concat({
          in: path.join(cwd, entry),
          out: node ? {
            path: path.join(cwd, 'static'),
            libraryTarget: 'commonjs2'
          } : path.join(cwd, 'static'),
          env: config.env || {},
          alias: config.alias || {},
          node
        })
      }, [])
    )
      .watch((e, stats) => {
        if (e) return log.error(e.message)

        buildCallback(stats)

        server && server.update()

        if (!server) {
          server = createServer(path.join(cwd, '/static/server.js'))
          server.init()
        }
      })

    onExit(() => {
      server && server.close()
    })
  })

prog
  .command('static')
  .action(() => {
    generator.render('/routes', '/static').then(() => {
    })
  })

if (!process.argv.slice(2).length) {
  prog.outputHelp(txt => {
    console.log(txt)
    exit()
  })
} else {
  prog.parse(process.argv)
}


