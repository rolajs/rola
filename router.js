import React from 'react'
import { parse, match, exec } from 'matchit'
import createStore from 'picostate'

const store = createStore({})

export const history = {
  get state () {
    return store.state
  },
  update (url, cb) {
    let location = typeof url === 'function' ? (
      url(this.state)
    ) : (
      url
    )

    location = location.replace(window.location.origin, '')

    store.hydrate({ location })(() => {
      cb(location)
    })
  },
  replaceState (url) {
    this.update(url, sanitized => {
      window.history.replaceState({}, '', sanitized)
    })
  },
  pushState (url, popstate) {
    this.update(url, sanitized => {
      !popstate && window.history.pushState({}, '', sanitized)
    })
  }
}

export function matcher (routes, redirects = []) {
  const matchers = routes.map(route => parse(route[0]))
  const dictionary = routes.reduce((dict, route) => {
    dict[route[0]] = route[1]
    return dict
  }, {})

  return function route (path) {
    const m = match(path, matchers)

    if (!m.length) return []

    return [
      dictionary[m[0].old],
      exec(path, m)
    ]
  }
}

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

      props.resolve({ location, params, route }, children => {
        this.setState({ children })
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
    const { children } = this.state
    return children
  }
}
