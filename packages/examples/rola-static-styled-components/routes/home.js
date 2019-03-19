import React from 'react'
import App from '@/components/App.js'
import styled from 'styled-components'

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

const H1 = styled.h1`
  color: blue;
`

export function view ({ pathname, state }) {
  return (
    <App state={state}>
      <H1>{state.title}</H1>
    </App>
  )
}
