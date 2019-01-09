import React from 'react'

export const path = '/'

export function load ({ state }) {
  return {
    state: {
      title: 'Hello world!',
    },
    meta: {
      title: 'Home'
    }
  }
}

export function view (props) {
  return (
    <div>
      <h1>{props.title}</h1>
      <pre>Hello</pre>
    </div>
  )
}
