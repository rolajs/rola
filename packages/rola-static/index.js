const fs = require('fs-extra')
const path = require('path')
const { watch } = require('chokidar')
const onExit = require('exit-hook')
const match = require('matched')
const rolaCompiler = require('@rola/compiler')
const node = require('@rola/preset-node')

const render = require('./lib/render.js')
const ledger = require('./lib/fileLedger.js')
const { fileManager, createWatchedFiles } = require('./lib/fileManager.js')
const { on, emit } = require('./lib/emitter.js')

const cwd = process.cwd()

function abs (p) {
  return path.join(cwd, p.replace(cwd, ''))
}

// TODO let top level process clean up, i.e. rola
module.exports = function rolaStatic ({
  env,
  alias,
  presets,
  plugins,
} = {}) {
  require('./lib/env.js')({ env, alias })

  let compiler
  let watcher

  /**
   * uses compiled asset filenames to find
   * the compiled filepaths
   */
  function getCompiledFiles (stats) {
    return  stats
      .reduce((pages, stats) => {
        return pages.concat(
          stats.assets
            .filter(asset => !/\.map$/.test(asset.name))
            .map(asset => asset.name)
        )
      }, [])
      .map(page => path.join(cwd, '.rola', 'static', page))
  }

  return {
    on,
    close () {
      watcher && watcher.close()
      return Promise.resolve(compiler ? compiler.close() : null)
    },
    async render (src, dest, options = {}) {
      src = /\.js$/.test(src) ? src : path.join(src, '*.js')

      const pages = createWatchedFiles(abs(src))

      if (!pages || !pages.length) return Promise.resolve()

      return rolaCompiler({
        in: src,
        out: {
          path: path.join(cwd, '.rola', 'static'),
          libraryTarget: 'commonjs2'
        },
        env,
        alias,
        presets: [
          node()
        ].concat(presets || [])
      })
        .build({
          minify: false
        })
        .then(stats => {
          const pages = getCompiledFiles(stats)

          return render(
            pages,
            abs(dest),
            { plugins }
          ).then(() => {
            options.cleanup !== false && fs.removeSync(path.join(cwd, '.rola'))
          })
        })
        .catch(e => {
          emit('error', e)
        })
    },
    async watch (src, dest, options = {}) {
      src = /\.js$/.test(src) ? src : path.join(src, '*.js')

      await this.render(src, dest, { cleanup: false })

      let compiler
      let restarting = false

      const manager = fileManager(abs(src), abs(dest))

      manager.on('updateWatchedFiles', async files => {
        if (compiler) {
          restarting = true
          await compiler.close()
          restarting = false

          createCompiler(files)
        } else {
          createCompiler(files)
        }
      })

      manager.init()

      function createCompiler (pages) {
        if (!pages || !pages.length) return

        compiler = rolaCompiler(pages.map(page => ({
          in: page,
          out: {
            path: path.join(cwd, '.rola', 'static'),
            libraryTarget: 'commonjs2'
          },
          env,
          alias,
          presets: [
            node()
          ].concat(presets || [])
        })))

        compiler.on('error', e => {
          emit('error', e)
        })
        compiler.on('warn', e => {
          emit('warn', e)
        })

        compiler.on('stats', stats => {
          const invalid = stats.reduce((bool, stat) => {
            if (stat.errors && stat.errors.length) bool = true
            return bool
          }, false)

          if (restarting || invalid) return

          const pages = getCompiledFiles(stats)

          render(
            pages,
            abs(dest),
            { plugins }
          )
        })

        compiler.watch()
      }

      onExit(() => {
        compiler && compiler.close()
        manager.close()
        fs.removeSync(path.join(cwd, '.rola'))
      })
    }
  }
}
