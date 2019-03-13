import React from 'react'
import createStore from 'picostate'
import matcher from './matcher.js'
import Hypr from './Hypr.js'

/**
 * this is passed to biti as a wrapper
 */
export default function HyprApp ({ state = {}, pathname, children }) {
  return (
    <Hypr store={createStore(state)} router={matcher([])} location={pathname}>
      {children}
    </Hypr>
  )
}
