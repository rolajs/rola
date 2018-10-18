const render = require('preact-render-to-string')
const { router, route } = require('foil')
const createStore = require('picostate')
const html = require('./html.js')
const { log } = require('./util.js')

function redir (res, { to, from }, status) {
  res.writeHead(status || 302, {
    Location: to,
    Referer: from
  })

  res.end()
}

function server (routes, state) {
  const app = router(routes.map(({ path, load, view }) => {
    return route({
      path,
      payload: { load, view }
    })
  }))

  const store = createStore(state)

  return (req, res) => {
    const { payload, redirect, context: routerContext } = app.resolve(req.url)

    if (!payload) {
      res.statusCode = 404
      res.end()
      return
    }

    if (redirect && redirect.to) return redir(res, redirect)

    store.hydrate({ router: routerContext })

    res.setHeader('Content-Type', 'text/html')

    return Promise.resolve(payload.load({
      req,
      state: store.state
    }) || {})
      .then(({ redirect, meta, state, server }) => {
        if (redirect && redirect.to) return redir(res, redirect, status)

        store.hydrate(state)

        const { cache, status } = server

        res.setHeader(
          'Cache-Control',
          cache !== false ? (
            `public, max-age=${cache || 86400}`
          ) : (
            `no-cache, no-store, must-revalidate`
          )
        )
        res.statusCode = status || 200
        res.end(html(store.state, meta, render(payload.view(store.state))))
      })
      .catch(e => {
        const meta = {
          title: '500 - Server Error'
        }

        store.hydrate({ meta })

        res.statusCode = 500
        res.end(html(store.state, meta, render(payload.view(store.state))))

        log(e)
      })
  }
}

module.exports = {
  server
}
