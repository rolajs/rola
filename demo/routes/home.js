import React from 'react'
import App from '@/components/App.js'

export const pathname = '/'

// export function config () {
//   return load()
// }

export function load (state, req) {
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
