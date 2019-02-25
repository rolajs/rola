import React from 'react'
import * as home from '@/src/routes/home.js'
import * as about from '@/src/routes/about.js'

export default [
  home,
  about,
  {
    pathname: '*',
    load () {
      return {
        status: 404,
        meta: {
          title: '404 Not Found'
        }
      }
    },
    view (props) {
      return (
        <h1>404 Not Found</h1>
      )
    }
  }
]
