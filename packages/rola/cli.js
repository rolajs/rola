#! /usr/bin/env node
'use strict'

const log = require('@rola/log')

/**
 * fresh console
 */
console.clear()

log({ actions: [ 'initializing' ] })

const fs = require('fs-extra')
const path = require('path')
const exit = require('exit')
const onExit = require('exit-hook')
const React = require('react')

const rolaCompiler = require('@rola/compiler')
const rolaStatic = require('@rola/static')
const { getConfig } = require('@rola/util')

const pkg = require('./package.json')
const createServer = require('./util/createServer.js')
const createConfig = require('./util/createConfig.js')

/**
 * compiled components
 */
const App = require('./dist/App.js')
const html = require('./dist/html.js')

const PORT = process.env.PORT || 3000
const cwd = process.cwd()
const prog = require('commander')
  .version(pkg.version)

let clientEntry
let serverEntry

try {
  clientEntry = require.resolve(path.join(cwd, 'client.js'))
} catch (e) {}

try {
  serverEntry = require.resolve(path.join(cwd, 'server.js'))
} catch (e) {}

let server

function serve () {
  if (!server) {
    server = createServer({
      file: path.join(cwd, '/static/server.js'),
      port: PORT
    })

    server.init()

    log({ server: [ PORT ] })

    onExit(() => {
      server && server.close()
    })
  }
}

function createGenerator ({ config, plugins }) {
  const generator = rolaStatic({
    env: config.env,
    alias: config.alias,
    macros: config.macros,
    plugins: [
      {
        wrapApp ({ app, context }) {
          return React.createElement(App, context, app)
        }
      },
      {
        createDocument (props) {
          return html(props)
        }
      }
    ].concat(plugins),
    filter (routes) {
      return routes.filter(r => !!r.config)
    }
  })

  generator.on('rendered', pages => {
    log({ static: pages })
  })
  generator.on('error', e => {
    log(state => ({
      error: state.error.concat(e)
    }))
  })

  return generator
}

prog
  .command('build')
  .action(async () => {
    log({ actions: [ 'build' ] })

    const { config, plugins } = await getConfig()

    const configs = []

    if (clientEntry) configs.push(createConfig({
      entry: clientEntry,
      env: config.env,
      alias: config.alias,
      macros: config.macros
    }))

    if (serverEntry) configs.push(createConfig({
      entry: serverEntry,
      env: config.env,
      alias: config.alias,
      macros: config.macros
    }))

    let allstats = []

    ;(configs.length ? rolaCompiler(configs).build() : Promise.resolve(null))
      .then(async stats => {
        stats.map(_stats => {
          const server = _stats.assets.reduce((bool, asset) => {
            if (/server/.test(asset.name)) bool = true
            return bool
          }, false)

          if (server) {
            allstats[1] = _stats
          } else {
            allstats[0] = _stats
          }
        })

        log({
          actions: [],
          stats: allstats
        })

        if (serverEntry) serve()

        await createGenerator({ config, plugins }).render('/routes', '/static')

        exit()
      })
      .catch(e => {
        log(state => ({
          error: state.error.concat(e)
        }))
      })
  })

prog
  .command('watch')
  .action(async () => {
    log({ actions: [ 'watch' ] })

    const { config, plugins } = await getConfig()

    let compiled = false
    const configs = []

    if (clientEntry) configs.push(createConfig({
      entry: clientEntry,
      env: config.env,
      alias: config.alias,
      banner: require('./util/clientReloader.js')(PORT),
      macros: config.macros
    }))

    if (serverEntry) configs.push(createConfig({
      entry: serverEntry,
      env: config.env,
      alias: config.alias,
      macros: config.macros
    }))

    let allstats = []

    if (configs.length) {
      const compiler = rolaCompiler(configs)

      compiler.on('error', e => {
        log(state => ({
          error: state.error.concat(e)
        }))
      })

      compiler.on('stats', stats => {
        stats.map(_stats => {
          const isServer = _stats.assets.reduce((bool, asset) => {
            if (/server/.test(asset.name)) bool = true
            return bool
          }, false)

          if (isServer) {
            allstats[1] = _stats
          } else {
            allstats[0] = _stats
          }
        })

        log({
          actions: [],
          error: [],
          warn: [],
          log: [],
          stats: allstats
        })

        server && server.update()

        serve()

        if (!compiled) {
          createGenerator({ config, plugins }).watch('/routes', '/static')

          compiled = true
        }
      })

      compiler.watch()
    } else {
      serve()
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


