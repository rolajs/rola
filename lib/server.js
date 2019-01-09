import React from 'react'
import { renderToString as render } from 'react-dom/server'
import { router, route } from 'foil'
import { Router } from '@foil/react'
import { Provider } from '@picostate/react'
import { routerStore, appStore } from './stores.js'
import html from './html.js'
import { log } from './util.js'

function redir (res, { to, from }, status) {
  res.writeHead(status || 302, {
    Location: to,
    Referer: from
  })

  res.end()
}

export default function server (routes, state) {
  const app = router(routes.map(({ path, load, view }) => {
    return route({
      path,
      payload: { load, view }
    })
  }))

  return (req, res) => {
    const { payload, redirect, context: routerContext } = app.resolve(req.url)

    if (!payload) {
      res.statusCode = 404
      res.end()
      return
    }

    if (redirect && redirect.to) return redir(res, redirect)

    appStore.hydrate({ router: routerContext })

    res.setHeader('Content-Type', 'text/html')

    return Promise.resolve(payload.load({
      req,
      state: appStore.state
    }) || {})
      .then(({ redirect, meta, state, server = {} }) => {
        if (redirect && redirect.to) return redir(res, redirect, status)

        appStore.hydrate(state)

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

        const str = render(
          <Router
            router={app}
            context={routerContext}
            resolve={({ payload, context }, rerender) => {
              rerender(payload.view)
            }}>
            <Provider store={appStore}>
              <payload.view {...appStore.state} />
            </Provider>
          </Router>
        )

        res.end(html(appStore.state, meta, str))
      })
      .catch(e => {
        const meta = {
          title: '500 - Server Error'
        }

        appStore.hydrate({ meta })

        res.statusCode = 500
        res.end(html(appStore.state, meta, '404'))

        log(e)
      })
  }
}
