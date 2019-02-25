import React from 'react'
import * as home from '@/src/routes/home.js'

export default [
  home,
  {
    pathname: '*',
    load () {
      return {
        status: 404
      }
    },
    view (props) {
      return (
        <h1>404 Not Found</h1>
      )
    }
  }
]
