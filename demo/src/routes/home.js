import React from 'react'

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
    <h1>{props.title}</h1>
  )
}
