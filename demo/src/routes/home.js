import React from 'react'
import App from '@/src/components/App.js'

export const pathname = '/'

export function load ({ state }) {
  return {
    meta: {
      title: 'hypr - the react toolkit',
    },
    props: {
      title: 'hypr - the react toolkit',
    }
  }
}

export function view (props) {
  return (
    <App>
      <h1>{props.title}</h1>
    </App>
  )
}
