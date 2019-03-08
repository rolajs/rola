import React from 'react'
import createStore from 'picostate'
import matcher from './matcher.js'
import Hypr from './Hypr.js'

export default function HyprApp (props) {
  return (
    <Hypr store={createStore(props)} router={matcher([])}>
      {props.children}
    </Hypr>
  )
}
