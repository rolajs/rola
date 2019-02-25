import createStore from 'picostate'
import { connect } from '@picostate/react'

export const store = createStore({})

export function withState (map) {
  return function componentWithState (Component) {
    return connect(map)(Component)
  }
}
