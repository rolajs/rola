const c = require('ansi-colors')
const createStore = require('picostate')
const output = process.env.DEBUG ? console.log : require('log-update')
const pkg = require('./package.json')

function cond (args) {
  return args && args
}

function filterUnique (arr) {
  return arr.reduce(reduceUniq, [])
}

function reduceUniq (arr, val) {
  if (arr.indexOf(val) > -1) return arr
  return arr.concat(val)
}

function concatUniq (one, two) {
  const merged = one.concat(two)
  return merged.reduce(reduceUniq, [])
}

function formatErrors (errors) {
  let length = 0

  return errors
    .map(e => {
      const lines = e.stack ? e.stack.split(/at\s/).slice(1) : []
      const stack = lines
        .map(line => {
          const [ fn, file ] = line.split(/\s/)

          if (fn.length > length) length = fn.length

          return {
            action: fn,
            location: file.replace(/[\(\)]/g, '').split(process.cwd()).reverse()[0]
          }
        })
        .filter(line => !/^internal\//.test(line.location))

      return {
        message: e.message || e,
        stack
      }
    })
    .reduce(reduceUniq, [])
    .map(e => {
      const stack = e.stack.length ? (
        e.stack.map(s => ({
          ...s,
          action: s.action.padEnd(length + 5)
        }))
      ) : []

      return {
        ...e,
        stack
      }
    })
}

function logger (opts) {
  const store = createStore({
    actions: [],
    stats: [],
    static: [],
    server: [],
    log: [],
    warn: [],
    error: [],
  })

  store.listen(log)

  function log (state) {
    const types = Object.keys(state).reduce((obj, key) => {
      const options = opts[key] || {}

      if (!state[key] || !state[key].length) {
        obj[key] = []
      } else {
        obj[key] = cond(
          options.format ? (
            options.format([].concat(state[key]))
          ) : (
            cond(state[key])
          )
        )
      }

      return obj
    }, {})

    let lines = [
      opts.banner,
      ...types.actions,
      ...types.server,
      ...types.stats,
      ...types.static,
      ...types.log,
      ...types.warn,
      ...types.error,
      [ '\n' ]
    ].filter(Boolean)

    const str = lines
      .map(line => {
        if (Array.isArray(line)) {
          line[0] = '\n' + line[0]
        } else {
          line = '\n' + line
        }
        return line
      })
      .flat(2)
      .map(line => {
        const indent = Array(opts.indent || 2).join(' ')
        if (/^\n/.test(line)) {
          const l = line.replace(/^\n/, '')
          return '\n' + indent + l
        }
        return indent + line
      })
      .join('\n')

    output(process.env.DEBUG ? (
      state
    ) : (
      str
    ))
  }

  return state => {
    store.hydrate(s => {
      const result = typeof state === 'function' ? state(s) : state

      Object.keys(result).map(key => {
        const options = opts[key] || {}

        if (Array.isArray(result[key])) {
          const merged = !options.merge ? result[key] : result[key].concat(s[key]) 

          result[key] = options.filter ? (
            options.filter(merged)
          ) : (
            merged.reduce(reduceUniq, [])
          )
        } else {
          if (options.filter) {
            result[key] = options.filter(result[key])
          }
        }
      })

      return result
    })()
  }
}

const log = logger({
  indent: 2,
  banner: `${c.bgBlue(` rola `)} v${pkg.version}`,
  log: {
    filter: filterUnique,
    format (logs) {
      return [
        logs.map(log => {
          return c.gray('log') + '  ' + log
        })
      ]
    },
  },
  warn: {
    filter: filterUnique,
    format (warnings) {
      return [
        warnings.map(warning => {
          return c.yellow('warn') + '  ' + warning
        })
      ]
    },
  },
  error: {
    filter: filterUnique, // won't work for objects
    format (errors) {
      return [
        formatErrors(errors).map(e => {
          return [
            c.red('error') + '  ' + e.message,
            e.stack && e.stack.map(trace => trace.action + '  ' + trace.location)
          ].filter(Boolean).flat()
        })
      ]
    },
  },
  stats: {
    merge: false,
    format (stats) {
      return stats.map(stats => {
        return [
          c.blue(stats.duration + 's')
        ].concat(
          stats.assets
            .filter(asset => !/\.map$/.test(asset.name))
            .map(asset => {
              return `  ${asset.name.padEnd(12)} ${c.gray(asset.size + 'kb')}`
            })
        )
      })
    }
  },
  static: {
    format (files) {
      return [
        files.map(file => {
          return c.gray('static') + '  ' + file
        })
      ]
    }
  },
  server: {
    format (port) {
      return [
        ('open ' + c.green(port))
      ]
    }
  }
})

if (!process.env.DEBUG) {
  ;['log', 'warn', 'error'].map(type => {
    console[type] = (...args) => {
      args = args.map(arg => {
        switch (typeof arg) {
          case 'object':
            return JSON.stringify(arg)
          case 'function':
            return '[Function' + (arg.name ? ': ' + arg.name : '') + ']'
          default:
            return arg
        }
      })

      log(state => ({
        [type]: state[type].concat(args)
      }))
    }
  })
}

module.exports = log
