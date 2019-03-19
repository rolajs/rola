#!/usr/bin/env node
'use strict';

const log = require('@rola/log')

log({ actions: [ 'initializing' ] })

const fs = require('fs-extra')
const path = require('path')
const exit = require('exit')
const onExit = require('async-exit-hook')

const compiler = require('@rola/compiler')
const pkg = require('./package.json')
const cwd = process.cwd()

const prog = require('commander')
  .version(pkg.version)

// const config = fs.existsSync(configfile) ? require(configfile) : {}

const rolaStatic = require('./index.js')

async function getConfig () {
  const cwd = process.cwd()
  const configfile = path.resolve(cwd, './rola.config.js')

  await compiler({
    in: configfile,
    out: {
      path: path.resolve(cwd, '.cache'),
      filename: 'rola.config.js',
      libraryTarget: 'commonjs2'
    }
  }).build()

  try {
    return require(path.resolve(cwd, '.cache/rola.config.js')).default
  } catch (e) {
    log(state => ({ error: state.error.concat(e) }))
    return config
  }
}

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

    // throw JSON.stringify(config)

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
