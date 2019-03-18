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

const rolaCompiler = require('@rola/compiler')
const rolaStatic = require('@rola/static')

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
  .option('-c, --config <path>', 'specify the path to your config file')

const configpath = path.join(cwd, prog.config || 'rola.config.js')
const config = fs.existsSync(configpath) ? require(configpath) : {}

let clientEntry
let serverEntry

try {
  serverEntry = require.resolve(path.join(cwd, 'server.js'))
} catch (e) {}

try {
  clientEntry = require.resolve(path.join(cwd, 'client.js'))
} catch (e) {}

let server

function serve () {
  if (!server) {
    server = createServer(path.join(cwd, '/static/server.js'), PORT)
    server.init()

    onExit(() => {
      server && server.close()
    })
  }
}

const generator = rolaStatic({
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
generator.on('rendered', pages => {
  log({ static: pages })
})
generator.on('error', e => {
  log(state => ({
    error: state.error.concat(e)
  }))
})

prog
  .command('build')
  .action(() => {
    log({ actions: [ 'build' ] })

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

        await generator.render('/routes', '/static')

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
  .action(() => {
    log({ actions: [ 'watch' ] })

    let compiled = false
    const configs = []

    if (clientEntry) configs.push(createConfig({
      entry: clientEntry,
      env: config.env,
      alias: config.alias,
      banner: require('./util/clientReloader.js')(PORT)
    }))

    if (serverEntry) configs.push(createConfig({
      entry: serverEntry,
      env: config.env,
      alias: config.alias
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
          stats: allstats
        })

        server && server.update()

        serve()

        if (!compiled) {
          generator.watch('/routes', '/static')

          if (!process.env.DEBUG) {
            ;['log', 'warn', 'error'].map(type => {
              console[type] = (...args) => {
                log(state => ({
                  [type]: state[type].concat(args)
                }))
              }
            })
          }

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


