module.exports = function createRoot ({ root, context, plugins }) {
  const handlers = plugins.filter(p => p && p.createRoot).map(p => p.createRoot)

  return handlers.reduce((view, handler) => {
    try {
      view = handler({
        root: view,
        context
      })
    } catch (e) {
      console.error(`createRoot failed`)
      console.error(e)
    }

    if (typeof view !== 'function') {
      console.error(`createRoot must return a component function`)
    }

    return view
  }, root)
}
