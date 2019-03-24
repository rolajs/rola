import React from 'react'
import { withState } from 'rola'
import App from '@/components/App.js'

export const pathname = '/'

export function load (state, req) {
  return {
    state: {
      title: 'home - hypr - the react toolkit',
      meta: {
        title: 'home - hypr - the react toolkit',
      },
    }
  }
}

export const view = withState(state => state)(
  function view ({ pathname, state }) {
    return (
      <App>
        <h1>{state.title}</h1>
      </App>
    )
  }
)
