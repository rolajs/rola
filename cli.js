#! /usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')
const exit = require('exit')
const onExit = require('exit-hook')
const app = require('commander')
const merge = require('merge-deep')
const compiler = require('@friendsof/spaghetti')
const logger = require('log-update')
const c = require('ansi-colors')
const PORT = process.env.PORT || 3002

app
  .arguments('<build>')
  .option('--config <config>', 'config file: --config config.js (default: hypr.config.js)')
  .parse(process.argv)

const production = app.args[0] && app.args[0] === 'build' || false
const config = resolve(app.config || 'hypr.config.js')

function log (...args) {
  if (typeof args[0] === 'function') {
    console.log(
      c.gray(`hypr`),
      ...[].concat(args[0](c))
    )
  } else {
    console.log(
      c.gray(`hypr`),
      ...args
    )
  }
}

function clear () {
  process.stdout.write('\x1B[2J\x1B[0f')
}

function resolve (...args) {
  return path.resolve(process.cwd(), ...args)
}

function join (...args) {
  return path.join(process.cwd(), ...args)
}

function createServer (file) {
  return {
    active: false,
    server: null,
    app: null,
    update () {
      this.app = require(file).default
    },
    init () {
      this.app = require(file).default

      this.server = http.createServer((req, res) => this.app(req, res))

      this.server.listen(PORT, e => {
        if (e) console.error(e)
        console.log(`hypr open ::${PORT}`)
        this.active = true
      })
    },
    close () {
      this.server && this.server.close()
    }
  }
}

function createConfig (filename) {
  const client = filename === 'client'
  return merge({
    in: resolve(`${filename}.js`),
    filename,
    outDir: resolve('build'),
    alias: {},
    plugins: [],
    target: client ? 'web' : 'node',
    output: client ? {} : {
      library: '__hypr_internal',
      libraryTarget: client ? 'umd' : 'commonjs2'
    },
    banner: client ? `` : `require('source-map-support').install();`
  }, (
    fs.existsSync(config) ? require(config)({
      [filename]: true,
      production
    }) : {})
  )
}

const clientConfig = createConfig('client')
const serverConfig = createConfig('server')

// console.log(JSON.stringify(clientConfig, null, '  '))
// console.log(JSON.stringify(serverConfig, null, '  '))

const client = compiler(clientConfig)
const server = compiler(serverConfig)

if (production) {
  client.build()
    .end(stats => {
      log(c => ([
        c.green(`compiled`),
        `in ${stats.duration}ms`
      ]))
      server.build()
        .end(stats => {
          log(c => ([
            c.green(`compiled`),
            `in ${stats.duration}ms`
          ]))
          exit()
        })
    })
} else {
  const parent = createServer(
    resolve(serverConfig.outDir, `${serverConfig.filename}.js`)
  )

  client.watch()
    .end(stats => {
      log(c => ([
        c.green(`compiled client`),
        `in ${stats.duration}ms`
      ]))
    })
    .error(err => {
      log(c => ([
        c.red(`error`),
        err ? err.message || err : ''
      ]))
    })
  server.watch()
    .end(stats => {
      log(c => ([
        c.green(`compiled server`),
        `in ${stats.duration}ms`
      ]))

      parent.active ? parent.update() : parent.init()
    })
    .error(err => {
      log(c => ([
        c.red(`error`),
        err ? err.message || err : ''
      ]))
    })

  onExit(() => {
    parent.close()
  })
}
