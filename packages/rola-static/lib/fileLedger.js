const fs = require('fs-extra')
const path = require('path')
const { on, emit } = require('./emitter.js')

const ledger = {}
const routes = new Set()

module.exports = {
  set (filename, paths) {
    ledger[filename] = paths
    for (let p of paths) routes.add(p)
    return ledger
  },
  get (filename) {
    return ledger[filename]
  },
  removeFile (filename, { cwd }) {
    const pathnames = ledger[filename]
    if (pathnames && pathnames.length) {
      return this.removePathnames(pathnames, { cwd })
    }
    return []
  },
  removePathnames (pathnames, { cwd }) {
    for (const pathname of pathnames) {
      let p = pathname
      if (p === '/') p = 'index.html'
      if (p === '/*') p = '404.html'

      const filepath = path.join(cwd, p)

      fs.removeSync(filepath)
      routes.delete(pathname)
    }
    return pathnames
  },
  getActiveRoutes () {
    return Array.from(routes)
      .sort((a, b) => {
        if (a.length > b.length) return 1
        if (a.length < b.length) return -1
        return 0
      })
  }
}
