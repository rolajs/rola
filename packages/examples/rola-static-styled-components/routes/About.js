import React from 'react'
import { withState } from 'rola'
import App from '@/components/App.js'

export const pathname = '/about'

export function load (state, req) {
  return {
    state: {
      title: 'about - hypr - the react toolkit',
      meta: {
        title: 'about - hypr - the react toolkit',
      },
    }
  }
}

export const view = withState(state => ({
  foo: true
}))(
  function view ({ pathname, state, foo }) {
    return (
      <App>
        <h1>{state.title}</h1>
      </App>
    )
  }
)
