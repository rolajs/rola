
      import { createStatic } from 'rola'
      const Route = require('/Users/estrattonbailey/Sites/oss/rola/packages/examples/rola-test/static/Home.js')

      export const pathname = Route.pathname || null
      export const state = Route.state || null
      export const load = Route.load || null
      export const view = createStatic(Route.view)
    