import { server } from 'hypr'
import routes from './routes/index.js'

export default require('connect')()
  .use(require('compression')())
  .use(require('serve-static')('static'))
  .use((req, res, next) => {
    server(routes, {})(req, res)
  })
