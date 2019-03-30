import React from 'react'
import ReactDOM from 'react-dom'
import createStore from 'picostate'
import { parse } from 'flatted/esm'

import matcher from './matcher.js'
import { history, withHistory } from './history.js'
import { store } from './state.js'
import Rola from './Rola.js'

import plugins from '@/.rola/rola.plugins.js'

const createClientRoot = require('@rola/util/createClientRoot.js')

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

  const View = createClientRoot({
    root: view,
    context: { ...context },
    plugins
  })

  ReactDOM.hydrate((
    <Rola
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

            Promise.resolve(options.resolve ? options.resolve({ state: store.state, pathname: route.pathname }) : null)
              .then(() => {
                document.title = meta.title || document.title

                let view = route.view

                const context = {
                  state: store.state,
                  pathname: route.pathname
                }

                const View = createClientRoot({
                  root: view,
                  context: { ...context },
                  plugins
                })

                done(<View {...context} />)
              })
              .catch(e => {
                console.error('options.resolve failed')
                console.error(e)
              })
          })
          .catch(e => {
            console.error('route.load failed')
            console.error(e)
          })
      }}>
        <View {...context} />
    </Rola>
  ), document.getElementById('root'))
}
