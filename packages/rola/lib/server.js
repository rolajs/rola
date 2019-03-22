import React from 'react'
import ReactDOMServer from 'react-dom/server'
import createStore from 'picostate'

import matcher from './matcher.js'
import Hypr from './Hypr.js'

let plugins = []

try {
  plugins = require('@/rola.plugins.js')
} catch (e) {}

const doc = require('@rola/util/document.js')
const createDocument = require('@rola/util/createDocument.js')
const createRoot = require('@rola/util/createRoot.js')
const postRender = require('@rola/util/postRender.js')
const preRender = require('@rola/util/preRender.js')

function clone (obj) {
  return Object.assign({}, obj)
}

function redir (res, Location, Referer, status = 302) {
  res.writeHead(status, { Location, Referer })
  res.end()
}

export default function server (routes, initialState = {}, options = {}) {
  const router = matcher(routes.map(({ pathname, ...route }) => [
    pathname,
    route
  ]))

  return function handler (req, res, next) {
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

        view = createRoot({
          root: view,
          context: clone(context),
          plugins
        })

        /**
         * preRender hook
         */
        const preRenderData = preRender({
          context: clone(context),
          plugins
        })

        context = Object.assign(clone(context), preRenderData)

        /**
         * render
         */
        const renderedView = ReactDOMServer.renderToString(
          <Hypr store={store} router={router} location={req.url}>
            {view(context)}
          </Hypr>
        )

        /**
         * postRender hook
         */
        const postRenderData = postRender({
          context: clone(context),
          plugins
        })

        context = Object.assign(clone(context), postRenderData)

        /**
         * create tags with new context
         */
        const tags = createDocument({
          context,
          plugins
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
