import React from 'react'
import ReactDOMServer from 'react-dom/server'
import createStore from 'picostate'
import merge from 'deepmerge'

import matcher from './matcher.js'
import html from './html.js'
import Hypr from './Hypr.js'

function redir (res, Location, Referer, status = 302) {
  res.writeHead(status, { Location, Referer })
  res.end()
}

export default function server (routes, initialState = {}, options = {}) {
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

        res.end(options.html({
          state: store.state,
          meta,
          view: ReactDOMServer.renderToString(
            <Hypr store={store} router={router} location={req.url}>
              {view(store.state)}
            </Hypr>
          )
        }))
      }).catch(e => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('(╯°□°）╯︵ ┻━┻\n\nhypr error')
        console.error(e.message)
      })
  }
}