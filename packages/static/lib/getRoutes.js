const path = require('path')
const readdir = require('recursive-readdir')
const req = require('./require.js')
const { emit } = require('./emitter.js')

module.exports = async function getRoutes (files) {
  let routes = []

  for (let file of files) {
    if (/chunk|\.map$/.test(file)) continue

    /** 
     * if pages are passed, we're watching for changes
     * so we need to clear the previous cache
     */
    if (require.cache[file]) {
      delete require.cache[file]
    }

    const { mod, err } = req(file)

    if (err) {
      emit('error', err)
      continue
    }

    if (!mod) continue

    mod.__filename = path.basename(file, '.js')

    routes.push(mod)
  }

  return routes
}
