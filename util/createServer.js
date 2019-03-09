const path = require('path')
const http = require('http')

const PORT = process.env.PORT || 3000
const cwd = process.cwd()

const log = require('./logger.js')('hypr')

function req (file) {
  let mod = null

  try {
    mod = require(file)
    mod = mod.default || mod
  } catch (e) {}

  return mod
}

module.exports = function createServer (file) {
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
    },
    init () {
      this.app = req(file)

      this.server = http.createServer(
        require('connect')()
          .use(require('compression')())
          .use(require('serve-static')(path.join(cwd, 'static')))
          .use((req, res, next) => {
            if (this.app) {
              this.app(req, res)
            } else {
              res.statusCode = 404
              res.end()
            }
          })
      )

      this.server.listen(PORT, e => {
        if (e) console.error(e)
        log.info('open', log.colors.green(PORT))
        active = true
      })
    },
    close () {
      this.server && this.server.close()
    }
  }
}
