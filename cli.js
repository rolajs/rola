#! /usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')
const exit = require('exit')
const onExit = require('exit-hook')
const app = require('commander')
const merge = require('deepmerge')
const compiler = require('@friendsof/spaghetti')
const c = require('ansi-colors')

const pkg = require('./package.json')
const log = require('./lib/logger.js')('hypr')

const PORT = process.env.PORT || 3002
const cwd = process.cwd()
const prog = require('commander')
  .version(pkg.version)
  .option('-c, --config <path>', 'specify the path to your config file')

function logAssets ({ duration, assets }, opts = {}) {
  log.info('built', `in ${duration}ms\n${assets.reduce((_, asset, i) => {
    const size = opts.gzip && asset.size.gzip ? asset.size.gzip + 'kb gzipped' : asset.size.raw + 'kb'
    return _ += `  > ${log.colors.gray(asset.filename)} ${size}${i !== assets.length - 1 ? `\n` : ''}`
  }, '')}`, opts.persist)
}

function createServer (file) {
  return {
    active: false,
    server: null,
    app: null,
    update () {
      delete require.cache[file]
      this.app = require(file).default
    },
    init () {
      this.app = require(file).default

      this.server = http.createServer((req, res) => this.app(req, res))

      this.server.listen(PORT, e => {
        if (e) console.error(e)
        log.info('open', log.colors.green(PORT))
        this.active = true
      })
    },
    close () {
      this.server && this.server.close()
    }
  }
}

function createConfig (filename, watch) {
  const client = filename === 'client'

  return {
    in: path.join(cwd, `${filename}.js`),
    filename,
    outDir: path.join(cwd, 'static'),
    alias: {
      '@': cwd
    },
    watch,
    target: client ? 'web' : 'node',
    output: client ? {} : {
      library: '__hypr_internal',
      libraryTarget: 'commonjs2'
    },
    banner: client ? `` : `require('source-map-support').install();`
  }
}

prog
  .command('build')
  .action(() => {
    const server = compiler(createConfig('server'))
    const client = compiler(createConfig('client'))

    log.info('building', '', true)

    client.build()
      .end(stats => {
        server.build()
          .end(serverStats => {
            logAssets(stats, {
              gzip: true,
              persist: true
            })
            logAssets(serverStats)

            exit()
          })
      })
  })

prog
  .command('watch')
  .action(() => {
    const serverConfig = createConfig('server', true)
    const server = compiler(serverConfig)
    const client = compiler(createConfig('client', true))
    const parent = createServer(
      path.join(serverConfig.outDir, `${serverConfig.filename}.js`)
    )

    log.info('watching', '', true)

    client.watch()
      .end(stats => {
        logAssets(stats, { gzip: true })
      })
      .error(e => {
        log.error(e.message || e)
      })
    server.watch()
      .end(stats => {
        logAssets(stats)
        parent.active ? parent.update() : parent.init()
      })
      .error(e => {
        log.error(e.message || e)
      })

    onExit(() => {
      parent.close()
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
