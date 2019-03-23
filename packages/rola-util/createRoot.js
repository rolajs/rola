module.exports = function createRoot ({ root, context, plugins }) {
  const handlers = plugins.filter(p => p && p.createRoot).map(p => p.createRoot)

  return handlers.reduce((view, handler) => {
    try {
      view = handler({
        root: root(context),
        context
      })
    } catch (e) {
      console.error(`createRoot failed`)
      console.error(e)
    }

    return view
  }, root)
}
