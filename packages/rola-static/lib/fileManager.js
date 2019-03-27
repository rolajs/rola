const fs = require('fs-extra')
const path = require('path')
const exit = require('exit')
const match = require('matched')
const { watch } = require('chokidar')
const { emit, on } = require('./emitter.js')
const ledger = require('./fileLedger.js')

const cwd = process.cwd()
const tmp = path.join(cwd, '.cache')

function createWatchedFiles (src) {
  const watchedFiles = []
  const rawFiles = match.sync(src)

  for (let file of rawFiles) {
    const filename = path.basename(file)

    const watchedFile = path.join(cwd, '.rola', 'createStatic', filename)

    watchedFiles.push(watchedFile)

    if (fs.existsSync(watchedFile)) continue

    fs.outputFileSync(watchedFile, `
      import { createStatic } from 'rola'
      const Route = require('${file}')

      export const pathname = Route.pathname || null
      export const state = Route.state || null
      export const load = Route.load || null
      export const view = createStatic(Route.view)
    `)
  }

  return watchedFiles
}

function fileManager (src, dest) {
  const watcher = watch(src, { ignoreInitial: true })
    .on('all', async (ev, page) => {
      if (!/unlink|add/.test(ev)) return

      if (/unlink/.test(ev)) {
        const filename = path.basename(page, '.js')
        const removed = ledger.removeFile(filename, { cwd: dest })

        fs.removeSync(path.join(cwd, '.rola', filename + '.js')) // compiled
        fs.removeSync(path.join(cwd, '.rola', 'createStatic', filename + '.js')) // wrapped
      }

      emit('updateWatchedFiles', createWatchedFiles(src))
    })

  return {
    on,
    init () {
      emit('updateWatchedFiles', createWatchedFiles(src))
    },
    close () {
      watcher.close()
    }
  }
}

module.exports = {
  fileManager,
  createWatchedFiles
}
