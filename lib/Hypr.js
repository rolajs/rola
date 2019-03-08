import React from 'react'
import { Provider } from '@picostate/react'
import Router from './router.js'

export default function Hypr ({ store, router, location, children }) {
  return (
    <Provider store={store}>
      <Router router={router} location={location}>
        {children}
      </Router>
    </Provider>
  )
}
