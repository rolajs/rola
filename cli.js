#! /usr/bin/env node
'use strict'

const fs = require('fs-extra')
const path = require('path')
const exit = require('exit')
const onExit = require('exit-hook')
const write = require('log-update')

const spitball = require('spitball')
const biti = require('biti')

const pkg = require('./package.json')
// const log = require('./util/logger.js')('hypr')
const log = require('./util/log.js')
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

const configpath = path.join(cwd, prog.config || 'hypr.config.js')
const config = fs.existsSync(configpath) ? require(configpath) : {}

let clientEntry
let serverEntry

try {
  serverEntry = require.resolve(path.join(cwd, 'server.js'))
} catch (e) {}

try {
  clientEntry = require.resolve(path.join(cwd, 'client.js'))
} catch (e) {}

// `require('source-map-support').install();`

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
generator.on('rendered', pages => {
  log({ static: pages })
})
generator.on('error', e => {
  log({ error: e.message || e })
})

prog
  .command('build')
  .action(() => {
    log({ msg: 'build' })

    const configs = []

    if (clientEntry) configs.push(createConfig({
      entry: clientEntry,
      env: config.env,
      alias: config.alias
    }))

    if (serverEntry) configs.push(createConfig({
      entry: serverEntry,
      env: config.env,
      alias: config.alias
    }))

    let allstats = []

    ;(configs.length ? spitball(configs).build() : Promise.resolve(null))
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
          msg: null,
          stats: allstats
        })

        await generator.render('/routes', '/static')
        exit()
      })
      .catch(e => {
        log({ error: e.message })
      })
  })

prog
  .command('watch')
  .action(() => {
    log({ msg: 'watch' })

    let server
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

    function serve () {
      if (!server) {
        server = createServer(path.join(cwd, '/static/server.js'), PORT)
        server.init()
      }
    }

    generator.watch('/routes', '/static')

    let allstats = []

    if (configs.length) {
      spitball(configs).watch((e, stats) => {
        if (e) return log({ error: e.message })

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
          msg: null,
          stats: allstats
        })

        server && server.update()

        serve()
      })
    } else {
      serve()
    }

    onExit(() => {
      server && server.close()
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


