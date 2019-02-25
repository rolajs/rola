import React from 'react'
import { hydrate } from 'react-dom'
import createStore from 'picostate'
import { Provider } from '@picostate/react'
import { parse } from 'flatted/esm'
import Router, { history, matcher } from './router.js'

const store = createStore({})

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
            .then(({ redirect, meta, props }) => {
              if (redirect) return history.pushState(redirect.to)

              store.hydrate(props)

              Promise.resolve(options.resolve && options.resolve(store.state))
                .then(() => {
                  document.title = meta.title || document.title
                  done(route.view(store.state))
                })
                .catch(e => {
                  console.log('options.resolve failed')
                })
            })
            .catch(e => {
              console.log('route.load failed')
            })
        }}>
        <Provider store={store}>
          {route.view(store.state)}
        </Provider>
      </Router>
    ), root)
  }
}
