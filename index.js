const http = require('http')
const { server } = require('./hypr/index.js')
const routes = require('./routes/index.js')

require('connect')()
  .use(require('compression')())
  .use(require('serve-static')('static'))
  .use((req, res, next) => {
    server(routes)(req, res)
  })
  .listen(3000)
