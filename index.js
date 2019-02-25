import { client } from './client.js'
import { withHistory, history } from './history.js'
import { withState, store } from './state.js'
import Link from './link.js'
import Router from './router.js'

/**
 * exported for non ssr applications
 */
export {
  client,
  withHistory,
  history,
  withState,
  store,
  Link,
  Router
}
