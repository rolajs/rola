const path = require('path')
const cwd = process.cwd()

module.exports = function env (config = {}) {
  let { alias = {}, env = {} } = config

  for (let key in alias) {
    alias[key] = path.resolve(cwd, alias[key])
  }

  require('module-alias').addAliases({
    '@': cwd,
    ...alias
  })

  for (let key in env) {
    process.env[key] = env[key]
  }
}
