import React from 'react'
import * as state from './state.js'
import { store, history } from './history.js'

export default class Router extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      children: props.children.pop ? props.children[0] : props.children
    }

    this.currentLocation = props.location

    store.listen(({ location }) => {
      const [ route, params ] = props.router(location)

      if (location === this.currentLocation) return
      if (route.redirect) return history.pushState(route.redirect.to)

      props.resolve({ location, params, route }, () => {
        this.currentLocation = location
        this.setState({ children: route.view })
      })
    })
  }

  componentDidMount () {
    window.addEventListener('popstate', e => {
      if (!e.target.window) return
      history.pushState(e.target.location.href, true)
    })
  }

  render () {
    const { children: Child } = this.state
    return typeof Child === 'function' ? <Child {...state.store.state} /> : Child
  }
}
