module.exports = function createServerRoot ({ root, context, plugins }) {
  const handlers = plugins.filter(p => p && p.createServerRoot).map(p => p.createServerRoot)

  return handlers.reduce((view, handler) => {
    try {
      view = handler({
        root: view,
        context
      })
    } catch (e) {
      console.error(`createServerRoot failed`)
      console.error(e)
    }

    if (typeof view !== 'function') {
      console.error(`createServerRoot must return a component function`)
    }

    return view
  }, root)
}
