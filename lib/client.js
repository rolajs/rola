import { h, patch } from 'superfine'
import { router, route } from 'foil'
import { routerStore, appStore } from './stores.js'
import { log } from './util.js'

export default function client (routes, state, root) {
  const app = router(routes.map(({ path, load, view }) => {
    return route({
      path,
      payload: { load, view }
    })
  }))

  const { payload, context } = app.resolve(req.url)

  routerStore.hydrate({ payload, context })

  appStore.hydrate({ router: context })
  appStore.hydrate(window.__hypr.app)

  function render (state, node) {
    node = patch(node, routerStore.state.payload.view(state), root)
  }

  appStore.listen(render)

  routerStore.listen(state => {
    render(appStore.state)
  })

  render(appStore.state)
}
