import React from 'react'
import ReactDOM from 'react-dom'
import createStore from 'picostate'
import { parse } from 'flatted/esm'

import matcher from './matcher.js'
import { history, withHistory } from './history.js'
import { store } from './state.js'
import Hypr from './Hypr.js'

let plugins = []

try {
  plugins = require('@/rola.plugins.js').default
} catch (e) {}

const createRoot = require('@rola/util/createRoot.js')

function clone (obj) {
  return Object.assign({}, obj)
}

// TODO root reaction and view reference needs to be addressed
export default function client (routes, initialState = {}, options = {}) {
  const location = window.location.href.replace(window.location.origin, '')

  const router = matcher(routes.map(({ pathname, ...route }) => [
    pathname,
    route
  ]))

  const [ route, params ] = router(location)

  const serverContext = parse(JSON.stringify(window.__rola))

  store.hydrate(Object.assign({}, serverContext.state, initialState, {
    router: {
      location,
      params
    }
  }))

  let view = route.view

  const context = {
    state: store.state,
    pathname: window.location.pathname
  }

  view = createRoot({
    root: view,
    context: clone(context),
    plugins
  })

  return function render (root) {
    ReactDOM.hydrate((
      <Hypr
        store={store}
        router={router}
        location={location}
        resolve={({ location, params, route }, done) => {
          store.hydrate({
            router: {
              location,
              params
            }
          })

          const {
            load = () =>  {},
            view
          } = route

          Promise.resolve(load(store.state))
            .then(({ redirect, state }) => {
              if (redirect) return history.pushState(redirect.to)

              const meta = state.meta || {}

              store.hydrate(state)

              Promise.resolve(options.resolve ? options.resolve(store.state) : null)
                .then(() => {
                  document.title = meta.title || document.title

                  let view = route.view

                  const context = {
                    state: store.state,
                    pathname: route.pathname
                  }

                  view = createRoot({
                    root: view,
                    context: clone(context),
                    plugins
                  })

                  done(view(context))
                })
                .catch(e => {
                  console.error('options.resolve failed', e)
                })
            })
            .catch(e => {
              console.error('route.load failed', e.message || e)
            })
        }}>
          {view(context)}
      </Hypr>
    ), root)
  }
}
