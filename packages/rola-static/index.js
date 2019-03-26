const fs = require('fs-extra')
const path = require('path')
const { watch } = require('chokidar')
const onExit = require('exit-hook')
const match = require('matched')
const rolaCompiler = require('@rola/compiler')
const node = require('@rola/preset-node')

const render = require('./lib/render.js')
const ledger = require('./lib/fileLedger.js')
const { on, emit } = require('./lib/emitter.js')

const cwd = process.cwd()

function abs (p) {
  return path.join(cwd, p.replace(cwd, ''))
}

module.exports = function rolaStatic ({
  env,
  alias,
  presets,
  plugins,
} = {}) {
  require('./lib/env.js')({ env, alias })

  let compiler
  let watcher

  const tmp = path.join(cwd, '.cache')

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
      .map(page => path.join(tmp, page))
  }

  return {
    on,
    close () {
      watcher && watcher.close()
      return Promise.resolve(compiler ? compiler.close() : null)
    },
    async render (src, dest, options = {}) {
      src = /\.js$/.test(src) ? src : path.join(src, '*.js')

      const pages = match.sync(abs(src))

      if (!pages || !pages.length) return Promise.resolve()

      return rolaCompiler({
        in: src,
        out: {
          path: tmp,
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
            options.cleanup !== false && fs.removeSync(tmp)
          })
        })
        .catch(e => {
          emit('error', e)
        })
    },
    async watch (src, dest, options = {}) {
      src = /\.js$/.test(src) ? src : path.join(src, '*.js'),

      onExit(() => {
        fs.removeSync(tmp)
      })

      await this.render(src, dest, { cleanup: false })

      let compiler
      let restarting = false

      watcher = watch(abs(src), {
        ignoreInitial: true
      })
        .on('all', async (ev, page) => {
          if (!/unlink|add/.test(ev)) return

          restarting = true

          if (/unlink/.test(ev)) {
            const filename = path.basename(page, '.js')
            const removed = ledger.removeFile(filename, { cwd: abs(dest) })

            fs.removeSync(path.join(tmp, filename + '.js'))
            fs.removeSync(path.join(tmp, filename + '.js.map'))
          }

          await compiler.close()

          restarting = false

          createCompiler()
        })

      function createCompiler () {
        const pages = match.sync(abs(src))

        if (!pages || !pages.length) return

        compiler = rolaCompiler(pages.map(page => ({
          in: page,
          out: {
            path: tmp,
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

      createCompiler()
    }
  }
}
