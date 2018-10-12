/** @jsx h */
import { h, render } from 'ultradom'
import { router } from 'foil'
import createStore from 'picostate'
import App from './App.js'

const store = createStore({})

function view (props) {
  return (
    <App>
      <h1>Hello world</h1>
    </App>
  )
}

function app (state) {
  return render(view(state), document.getElementById('root'))
}

document.addEventListener('DOMContentLoaded', e => {
  store.hydrate(window.__hydrate__)

  app(store.state)

  store.listen(state => app(state))
})
