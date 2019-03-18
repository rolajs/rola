import React from 'react'
import App from '@/components/App.js'

export const pathname = '/'

export function config (state, req) {
  return {
    state: {
      title: 'home - hypr - the react toolkit',
      meta: {
        title: 'home - hypr - the react toolkit',
      },
    }
  }
}

export function view ({ pathname, state }) {
  return (
    <App state={state}>
      <h1>{state.title}</h1>
    </App>
  )
}
