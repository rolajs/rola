import React from 'react'
import App from '@/src/components/App.js'

export const pathname = '/about'

export function load ({ state }) {
  return {
    meta: {
      title: 'about - hypr - the react toolkit',
    },
    props: {
      title: 'about - hypr - the react toolkit',
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
