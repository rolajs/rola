import React from 'react'
import { createStatic } from 'rola'
import * as Home from '@/routes/Home.js'

export const pathname = Home.pathname

export function config (state, req) {
  return Home.load()
}

export const view = createStatic(Home.view)
