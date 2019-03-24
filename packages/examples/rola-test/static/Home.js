import React from 'react'
import { createStatic } from 'rola'
import * as Home from '@/routes/Home.js'

export const pathname = Home.pathname

export function config () {
  return {
    state: {
      title: 'home - hypr - the react toolkit',
      meta: {
        title: 'home - hypr - the react toolkit',
      },
    }
  }
}

export const view = createStatic(Home.view)
