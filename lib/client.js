import React from 'react'
import { hydrate } from 'react-dom'
import { router, route } from 'foil'
import { Router } from '@foil/react'
import { Provider } from '@picostate/react'
import { routerStore, appStore } from './stores.js'
import { log } from './util.js'

/**
 * Make sure we don't bleed memory into the stores
 */
export default function client (routes, state) {
  return function render (root) {
    const app = router(routes.map(({ path, load, view }) => {
      return route({
        path,
        payload: { load, view }
      })
    }))

    const { payload, context } = app.resolve(window.location.pathname)

    routerStore.hydrate({ payload, context })

    appStore.hydrate({ router: context })
    appStore.hydrate(window.__hypr.app)

    hydrate((
      <Router
        router={app}
        context={context}
        resolve={({ payload, context }, rerender) => {
          rerender(payload.view)
        }}>
        <Provider store={appStore}>
          <payload.view {...state} />
        </Provider>
      </Router>
    ), root)
  }
}
