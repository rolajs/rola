const http = require('http')
let app = require('./server.js').default // YOUR APP
const server = http.createServer((req, res) => app(req, res))
const PORT = process.env.PORT || 3000

server.listen(PORT, e => {
  if (e) console.error(e)
  console.log(`node server listening at port ${PORT}`)
})

if (module.hot) {
  module.hot.accept('./server.js', () => {
    app = require('./server.js').default
  })
}
