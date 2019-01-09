import * as home from './home.js'

export default [
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
