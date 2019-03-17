import React from 'react'
import ReactDOM from 'react-dom'
import createStore from 'picostate'
import { parse } from 'flatted/esm'

import matcher from './matcher.js'
import { history, withHistory } from './history.js'
import { store } from './state.js'
import Hypr from './Hypr.js'

export default function client (routes, initialState = {}, options = {}) {
  const location = window.location.href.replace(window.location.origin, '')

  const router = matcher(routes.map(({ pathname, ...route }) => [
    pathname,
    route
  ]))

  const [ route, params ] = router(location)

  const serverState = parse(JSON.stringify(window.__yep))

  store.hydrate({
    ...serverState,
    ...initialState,
    router: {
      location,
      params
    }
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
                  done()
                })
                .catch(e => {
                  console.error('options.resolve failed', e)
                })
            })
            .catch(e => {
              console.error('route.load failed', e.message || e)
            })
        }}>
        {route.view(store.state)}
      </Hypr>
    ), root)
  }
}
