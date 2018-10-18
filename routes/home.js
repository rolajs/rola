const { h } = require('preact')

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
    h('h1', {}, props.title),
    h('pre', {}, JSON.stringify(props, null, '  '))
  ])
}

module.exports = {
  path: '/',
  load,
  view
}
