import React from 'react'
import { hydrate } from 'react-dom'
import createStore from 'picostate'
import { Provider } from '@picostate/react'
import { parse } from 'flatted/esm'

import matcher from './lib/matcher.js'
import { history, withHistory } from './history.js'
import { store } from './state.js'
import Link from './link.js'
import Router from './router.js'

export function client (routes, initialState = {}, options = {}) {
  const location = window.location.href.replace(window.location.origin, '')

  const router = matcher(routes.map(({ pathname, ...route }) => [
    pathname,
    route
  ]))

  const [ route, params ] = router(location)

  const serverState = parse(JSON.stringify(window.__hypr))

  store.hydrate({
    ...serverState,
    ...initialState,
    router: {
      location,
      params
    }
  })

  return function render (root) {
    hydrate((
      <Provider store={store}>
        <Router
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
              .then(({ redirect, meta = {}, props }) => {
                if (redirect) return history.pushState(redirect.to)

                store.hydrate(props)

                Promise.resolve(options.resolve && options.resolve(store.state))
                  .then(() => {
                    document.title = meta.title || document.title
                    done(route.view(store.state))
                  })
                  .catch(e => {
                    console.log(e)
                    console.log('options.resolve failed')
                  })
              })
              .catch(e => {
                console.log('route.load failed')
              })
          }}>
          {route.view(store.state)}
        </Router>
      </Provider>
    ), root)
  }
}
