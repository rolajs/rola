const path = require('path')
const http = require('http')
const { document } = require('@rola/util')

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

  const serverProps = require(path.join(cwd, '.rola', 'props.js'))

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

            res.serverProps = serverProps

            this.app(req, res, next)
          })
          .use((req, res) => {
            const { name, version } = serverProps.context

            res.writeHead(404, { 'Content-Type': 'text/html' })

            res.write(document({
              head: [ `<link rel='stylesheet' href='https://unpkg.com/svbstrate@4.1.0/dist/svbstrate.css' />` ],
              view: `<div class='f aic jcc x h4' style='height: 100vh'>404 | ${name}@${version}</div>`,
              context: {
                state: {
                  meta: {
                    title: '404 | rola'
                  }
                }
              }
            }))

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
