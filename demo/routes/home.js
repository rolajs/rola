const { h } = require('hypr')

function load ({ state }) {
  return {
    state: {
      title: 'Hello world!',
    },
    meta: {
      title: 'Home'
    }
  }
}

function view (props) {
  return h('div', {}, [
    h('h1', { key: 'a' }, props.title),
    h('pre', { key: 'b' }, 'Hello')
  ])
}

module.exports = {
  path: '/',
  load,
  view
}
