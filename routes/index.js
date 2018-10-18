const home = require('./home.js')

module.exports = [
  home,
  {
    path: '*',
    view (props) {
      return '404'
    },
    load () {
      return {
        server: {
          status: 404
        },
        meta: {
          title: '404 Not Found'
        }
      }
    }
  }
]
