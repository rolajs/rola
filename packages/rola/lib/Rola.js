import React from 'react'
import { Provider } from '@picostate/react'
import Router from './router.js'

/**
 * this is used internally for server.js, client.js, and App.js
 */
export default function Rola ({ store, router, location, resolve, children }) {
  return (
    <Provider store={store}>
      <Router router={router} location={location} resolve={resolve}>
        {children}
      </Router>
    </Provider>
  )
}
