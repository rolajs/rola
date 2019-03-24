import React from 'react'
import { createStatic } from 'rola'
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

export const view = createStatic(
  function view ({ pathname, state }) {
    return (
      <App>
        <H1>{state.title}</H1>
      </App>
    )
  }
)
