#! /usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')
const exit = require('exit')
const onExit = require('exit-hook')
const app = require('commander')
const merge = require('deepmerge')
const c = require('ansi-colors')

const pkg = require('./package.json')
const log = require('./lib/logger.js')('hypr')
const { createCompilers } = require('./lib/compiler.js')

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

prog
  .command('build')
  .action(() => {
    const { client, server } = createCompilers()

    log.info('building', '', true)

    Promise.all([
      new Promise((res, rej) => {
        if (!client.config) return res()

        client.compiler.build()
          .end(stats => res(stats))
          .error(e => rej(e))
      }),
      new Promise((res, rej) => {
        if (!server.config) return res()

        server.compiler.build()
          .end(stats => res(stats))
          .error(e => rej(e))
      })
    ]).then(([ cs, ss ]) => {
      cs && logAssets(cs, {
        gzip: true,
        persist: true
      })

      ss && logAssets(ss)

      exit()
    })

  })

prog
  .command('watch')
  .action(() => {
    const { client, server } = createCompilers({ watch: true })

    log.info('watching', '', true)

    if (client.config) {
      client.compiler.watch()
        .end(stats => {
          log.info('built', `${log.colors.gray('client')} in ${stats.duration}ms`)
        })
        .error(e => {
          log.error(e.message || e)
        })
    }

    if (server.config) {
      const serve = createServer(
        path.join(server.config.outDir, `${server.config.filename}.js`)
      )

      server.compiler.watch()
        .end(stats => {
          log.info('built', `${log.colors.gray('server')} in ${stats.duration}ms`)
          serve.active ? serve.update() : serve.init()
        })
        .error(e => {
          log.error(e.message || e)
        })

      onExit(() => {
        serve.close()
      })
    }
  })

if (!process.argv.slice(2).length) {
  prog.outputHelp(txt => {
    console.log(txt)
    exit()
  })
} else {
  prog.parse(process.argv)
}
