import React from 'react'
import createStore from 'picostate'

export const store = createStore({})

function historyUpdater (url, cb) {
  let location = typeof url === 'function' ? (
    url(store.state)
  ) : (
    url
  )

  location = location.replace(window.location.origin, '')

  store.hydrate({ location })(() => {
    cb(location)
  })
}

export const history = {
  get state () {
    return store.state
  },
  replaceState (url) {
    historyUpdater(url, sanitized => {
      window.history.replaceState({}, '', sanitized)
    })
  },
  pushState (url, popstate) {
    historyUpdater(url, sanitized => {
      !popstate && window.history.pushState({}, '', sanitized)
    })
  }
}

export function withHistory (Component) {
  return props => (
    <Component history={history} {...props} />
  )
}
