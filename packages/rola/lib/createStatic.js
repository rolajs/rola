import React from 'react'
import createStore from 'picostate'
import matcher from './matcher.js'
import Hypr from './Hypr.js'

export default function createStatic (Component) {
  return function StaticComponent ({ state, pathname }) {
    return (
      <Hypr store={createStore(state)} router={matcher([])} location={pathname}>
        <Component state={state} pathname={pathname} />
      </Hypr>
    )
  }
}
