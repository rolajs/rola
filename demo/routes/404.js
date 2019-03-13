import React from 'react'

export const pathname = '*'

export function load (state, req) {
  return {
    status: 404,
    state: {
      meta: {
        title: '404 Not Found'
      }
    }
  }
}

export function view ({ pathname, state }) {
  return (
    <h1>404 Not Found</h1>
  )
}
