import React from 'react'
import ReactDOMServer from 'react-dom/server'
import createStore from 'picostate'

import matcher from './matcher.js'
import Hypr from './Hypr.js'

let plugins = []

try {
  plugins = require('@/rola.plugins.js').default
} catch (e) {}

const doc = require('@rola/util/document.js')
const createDocument = require('@rola/util/createDocument.js')
const createServerRoot = require('@rola/util/createServerRoot.js')
const postServerRender = require('@rola/util/postServerRender.js')
const preServerRender = require('@rola/util/preServerRender.js')

function redir (res, Location, Referer, status = 302) {
  res.writeHead(status, { Location, Referer })
  res.end()
}

export default function server (routes, initialState = {}, options = {}) {
  const router = matcher(routes.map(({ pathname, ...route }) => [
    pathname,
    route
  ]))

  return function handler (req, res, next, serverProps) {
    const store = createStore({})

    const [ route, params ] = router(req.url)

    if (!route) {
      return next()
    }

    let {
      state: initialRouteState = {},
      load = () => {},
      view,
      redirect
    } = route

    if (redirect) return redir(res, redirect)

    store.hydrate(Object.assign(
      initialState,
      initialRouteState,
      {
        router: {
          location: req.url,
          params
        }
      }
    ))

    return Promise.resolve(load(store.state, req))
      .then(({ redirect, cache, status, pathname, state = {} } = {}) => {
        if (redirect) return redir(res, redirect)

        /**
         * set default response headers
         */
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

        /**
         * add any loaded state to store
         */
        store.hydrate(state)

        /**
         * create initial context
         */
        let context = {
          state: store.state,
          pathname: route.pathname || pathname
        }

        const View = createServerRoot({
          root: view,
          context: { ...context },
          plugins
        })

        /**
         * preServerRender hook
         */
        const preRenderData = preServerRender({
          context: { ...context },
          plugins
        })

        /**
         * render
         */
        const renderedView = ReactDOMServer.renderToString(
          <Hypr store={store} router={router} location={req.url}>
            <View {...context} {...preRenderData} />
          </Hypr>
        )

        /**
         * postServerRender hook
         */
        const postRenderData = postServerRender({
          context: { ...context },
          plugins
        })

        /**
         * create tags with new context
         */
        const tags = createDocument({
          context: {
            ...context,
            ...serverProps.context
          },
          plugins,
          ...preRenderData,
          ...postRenderData,
          ...serverProps.tags // { head, body }
        })

        /**
         * return response
         */
        res.end(
          doc({ ...tags, context, view: renderedView })
        )
      }).catch(e => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('rola error')
        console.log(e)
      })
  }
}
