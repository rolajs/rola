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
      const filepath = path.join(cwd, pathname === '/' ? 'index.html' : pathname)
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
