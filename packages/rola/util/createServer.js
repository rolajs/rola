const path = require('path')
const http = require('http')

const cwd = process.cwd()

function req (file) {
  let mod = null

  try {
    mod = require(file)
    mod = mod.default || mod
  } catch (e) {}

  return mod
}

module.exports = function createServer ({ file, port }) {
  let active = false

  return {
    server: null,
    app: null,
    get active () {
      return active
    },
    update () {
      try {
        delete require.cache[file]
      } catch (e) {}
      this.app = req(file)
      this.socket && this.socket.emit('update')
    },
    init () {
      this.app = req(file)

      this.server = http.createServer(
        require('connect')()
          .use(require('compression')())
          .use(require('serve-static')(path.join(cwd, 'build/assets')))
          .use((req, res, next) => {
            if (!this.app) return next()
            this.app(req, res, next)
          })
          .use((req, res) => {
            res.writeHead(404, {
              'Content-Type': 'text/plain'
            })
            res.write('rola')
            res.end()
          })
      )

      this.socket = require('socket.io')(this.server, {
        serveClient: false
      })

      this.server.listen(port, e => {
        if (e) return console.log(e)
        active = true
      })
    },
    close () {
      this.server && this.server.close()
      this.socket && this.socket.close()
    }
  }
}
