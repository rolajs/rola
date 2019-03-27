import React from 'react'
import * as About from '@/routes/About.js'

export const pathname = About.pathname

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

export const view = About.view
