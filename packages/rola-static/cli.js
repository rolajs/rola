#!/usr/bin/env node
'use strict';

const log = require('@rola/log')

log({ actions: [ 'initializing' ] })

const fs = require('fs-extra')
const path = require('path')
const exit = require('exit')
const onExit = require('async-exit-hook')
const pkg = require('./package.json')
const req = require('./lib/require.js')

const cwd = process.cwd()

const prog = require('commander')
  .version(pkg.version)
  .option('-c, --config <config>', 'path to config file, default: rola.config.js')
  .parse(process.argv)

const configfile = path.resolve(cwd, (prog.config || './rola.config.js'))
const config = fs.existsSync(configfile) ? require(configfile) : {}

const rolaStatic = require('./index.js')

prog
  .command('render <src> <dest>')
  .action((src, dest) => {
    let time = Date.now()

    log({ actions: [ 'rendering' ] })

    const app = rolaStatic(config)

    app.on('error', e => log(state => ({ errors: state.errors.concat(e) })))
    app.on('rendered', pages => {
      log({ static: pages })
    })
    app.render(src, dest)
  })

prog
  .command('watch <src> <dest>')
  .action(async (src, dest) => {
    const app = rolaStatic(config)

    log({ actions: [ 'watching' ] })

    app.on('error', e => log(state => ({ errors: state.errors.concat(e) })))
    app.on('rendered', pages => {
      log({ static: pages })
    })

    app.watch(src, dest)

    onExit(cb => {
      app.close().then(cb)
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
