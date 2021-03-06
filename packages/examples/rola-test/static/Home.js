import React from 'react'
import * as Home from '@/routes/Home.js'

export const pathname = Home.pathname

export function load () {
  return {
    state: {
      title: 'home - hypr - the react toolkit',
      meta: {
        title: 'home - hypr - the react toolkit',
      },
    }
  }
}

export const view = Home.view
