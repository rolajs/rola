const React = require('react')
const fs = require('fs-extra')
const path = require('path')
const { renderToString } = require('react-dom/server')
const getRoutes = require('./getRoutes.js')
const loadRoutes = require('./loadRoutes.js')
const ledger = require('./fileLedger.js')
const { emit } = require('./emitter.js')

const {
  document: doc,
  createDocument,
  createRoot,
  preRender,
  postRender
} = require('@rola/util')

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
  const routes = await getRoutes(pages).then(routes => {
    if (!options.filter) return routes

    const filtered = options.filter(routes)

    routes
      .filter(route => filtered.indexOf(route) < 0)
      .map(route => {
        const filename = path.basename(route.__filename, '.js')

        ledger.removeFile(filename, { cwd: dest })

        // emit('rendered', ledger.getActiveRoutes())
      })

    return filtered
  })

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
          let view = route.view

          let context = {
            state: route.state,
            pathname: route.pathname
          }

          view = createRoot({
            root: view,
            context: clone(context),
            plugins: options.plugins
          })

          /**
           * preRender hook
           */
          const preRenderData = preRender({
            context: clone(context),
            plugins: options.plugins
          })

          context = Object.assign(clone(context), preRenderData)

          /**
           * render
           */
          const renderedView = renderToString(
            view(
              clone(context)
            )
          )

          /**
           * postRender hook
           */
          const postRenderData = postRender({
            context: clone(context),
            plugins: options.plugins
          })

          context = Object.assign(clone(context), postRenderData)

          /**
           * create tags with new context
           */
          const tags = createDocument({
            context: clone(context),
            plugins: options.plugins
          })

          await fs.outputFile(
            path.join(dir, 'index.html'),
            doc({ ...tags, context, view: renderedView }),
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
