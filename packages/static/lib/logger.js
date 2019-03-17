const c = require('ansi-colors')
const write = require('log-update')
const log = console.log

module.exports = function logger (scope) {
  return {
    colors: c,
    info (action, message, persist) {
      (persist ? write : log)([
        c.gray(scope),
        c.blue(action) + ' ' + (message || '')
      ].filter(Boolean).join(' '))
    },
    error (message) {
      write([
        c.gray(scope),
        c.red('error') + ' ' + (message || '')
      ].filter(Boolean).join(' '))
    }
  }
}
