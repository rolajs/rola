module.exports = function preServerRender ({ context, plugins }) {
  const handlers = plugins.filter(p => p && p.preServerRender).map(p => p.preServerRender)

  return handlers.reduce((data, handler) => {
    try {
      data = Object.assign(data, handler({ context }))
    } catch (e) {
      console.error(`preServerRender failed`)
      console.error(e)
    }

    return data
  }, {})
}
