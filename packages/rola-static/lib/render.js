const React = require('react')
const fs = require('fs-extra')
const path = require('path')
const { renderToString } = require('react-dom/server')
const getRoutes = require('./getRoutes.js')
const loadRoutes = require('./loadRoutes.js')
const ledger = require('./fileLedger.js')
const { emit } = require('./emitter.js')

function clone (obj) {
  return Object.assign({}, obj)
}

/**
 * accepts a `src` directory or array of `pages`
 *
 * if pages is undefined, assumes directory, and vice versa
 *
 * loadRoutes wraps all routes and initiates their loaders,
 * so this file simply needs to wait for those to finish,
 * and render the routes when they're ready to go
 */
module.exports = async function render (pages, dest, options) {
  const routes = await getRoutes(pages)

  const serverProps = require(path.join(process.cwd(), '.rola', 'props.js'))

  return Promise.all(
    loadRoutes(routes).map(async resolver => {
      const resolved = await resolver()

      if (!resolved) return

      const [ filename, routes ] = resolved

      let currentpaths = []

      for (let route of routes) {
        const dir = path.join(dest, route.pathname)

        currentpaths.push(route.pathname)

        try {
          const context = {
            state: route.state,
            pathname: route.pathname
          }

          fs.outputFileSync(
            path.join(dir, 'index.html'),
            route.view(context, serverProps),
            e => {
              if (e) {
                emit('error', e)
              }
            }
          )

          emit(
            'render',
            dir.split(dest)[1] || '/'
          )
        } catch (e) {
          e.message = `rola error rendering ${route.pathname} -> ${e.message}`
          emit('error', e)
        }
      }

      const previouspaths = ledger.get(path.basename(filename, '.js'))

      if (previouspaths) {
        let deleted = []

        for (const prev of previouspaths) {
          if (currentpaths.indexOf(prev) > -1) continue
          deleted.push(prev)
        }

        if (deleted.length) {
          ledger.removePathnames(deleted, { cwd: dest })
        }
      }

      ledger.set(path.basename(filename, '.js'), currentpaths)
    })
  ).then(() => {
    emit('rendered', ledger.getActiveRoutes())
  })
}
