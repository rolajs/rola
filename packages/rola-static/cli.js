#!/usr/bin/env node
'use strict';

const log = require('@rola/log')()

log({ actions: [ 'initializing' ] })

const fs = require('fs-extra')
const path = require('path')
const exit = require('exit')
const onExit = require('async-exit-hook')

const pkg = require('./package.json')
const cwd = process.cwd()

const compiler = require('@rola/compiler')
const { getConfig } = require('@rola/util')

const prog = require('commander')
  .version(pkg.version)

const rolaStatic = require('./index.js')

prog
  .command('render <src> <dest>')
  .action(async (src, dest) => {
    let time = Date.now()

    log({ actions: [ 'rendering' ] })

    const config = await getConfig()

    const app = rolaStatic(config)

    app.on('error', e => log(state => ({ error: state.error.concat(e) })))
    app.on('rendered', pages => {
      log({ static: pages })
    })
    app.render(src, dest)
  })

prog
  .command('watch <src> <dest>')
  .action(async (src, dest) => {
    log({ actions: [ 'watching' ] })

    const config = await getConfig()

    const app = rolaStatic(config)

    app.on('error', e => log(state => ({ error: state.error.concat(e) })))
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
