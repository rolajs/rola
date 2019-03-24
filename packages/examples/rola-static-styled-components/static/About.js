import React from 'react'
import { createStatic, withState } from 'rola'
import App from '@/components/App.js'

export const pathname = '/about'

export function config (state, req) {
  return {
    state: {
      title: 'about - hypr - the react toolkit',
      meta: {
        title: 'about - hypr - the react toolkit',
      },
    }
  }
}

export const view = createStatic(
  withState(state => ({
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
)
