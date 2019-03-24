const path = require('path')
const merge = require('deepmerge')
const { emit } = require('./emitter.js')

/**
 * should pry rewrite this to use Promise.all
 * and only render the successful promsies
 */
module.exports = function loadRoutes (routes) {
  return routes.map(route => {
    return () => {
      return Promise.resolve(route.load ? route.load() : {})
        .then(load => {
          return [
            route.__filename,
            [].concat(load)
              .map(conf => merge(route, conf))
              .filter(conf => conf.pathname && conf.view) // invalid routes
              .map(({ pathname, ...rest })=> {
                return {
                  ...rest,
                  pathname: path.join('/', pathname)
                }
              })
          ]
        })
        .catch(e => emit('error', e))
    }
  })
}
