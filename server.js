import React from 'react'
import { renderToString } from 'react-dom/server'
import createStore from 'picostate'
import { Provider } from '@picostate/react'
import merge from 'deepmerge'

import matcher from './lib/matcher.js'
import html from './lib/html.js'
import Router from './router.js'

function redir (res, Location, Referer, status = 302) {
  res.writeHead(status, { Location, Referer })
  res.end()
}

export function server (routes, initialState = {}, options = {}) {
  const router = matcher(routes.map(({ pathname, ...route }) => [
    pathname,
    route
  ]))

  options.html = options.html || html

  return function handler (req, res) {
    const store = createStore({})

    const [ route, params ] = router(req.url)

    if (!route) {
      res.statusCode = 404
      res.end()
      return
    }

    const {
      props: initialProps = {},
      load = () => {},
      view,
      redirect
    } = route

    if (redirect) return redir(res, redirect)

    store.hydrate(Object.assign(
      initialState,
      initialProps,
      {
        router: {
          location: req.url,
          params
        }
      }
    ))

    return Promise.resolve(load(store.state, req))
      .then(({ redirect, cache, status, meta, props = {} }) => {
        if (redirect) return redir(res, redirect)

        res.statusCode = status || 200
        res.setHeader('Content-Type', 'text/html')
        res.setHeader(
          'Cache-Control',
          typeof cache === 'string' ? cache : (
            cache === false ? (
              `no-cache, no-store, must-revalidate`
            ) : (
              `public, max-age=${cache || 86400}`
            )
          )
        )

        store.hydrate(props)

        res.end(options.html(store.state, meta, renderToString(
          <Router router={router} location={req.url}>
            <Provider store={store}>
              {view(store.state)}
            </Provider>
          </Router>
        )))
      }).catch(e => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('(╯°□°）╯︵ ┻━┻\n\nhypr error')
        console.error(e.message)
      })
  }
}
