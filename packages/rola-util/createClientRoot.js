module.exports = function createClientRoot ({ root, context, plugins }) {
  const handlers = plugins.filter(p => p && p.createClientRoot).map(p => p.createClientRoot)

  return handlers.reduce((view, handler) => {
    try {
      view = handler({
        root: view,
        context
      })
    } catch (e) {
      console.error(`createClientRoot failed`)
      console.error(e)
    }

    if (typeof view !== 'function') {
      console.error(`createClientRoot must return a component function`)
    }

    return view
  }, root)
}
