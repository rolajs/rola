import React from 'react'

export const pathname = '*'

export function load (state, req) {
  return {
    status: 404,
    meta: {
      title: '404 Not Found'
    }
  }
}

export function view (props) {
  return (
    <h1>404 Not Found</h1>
  )
}
