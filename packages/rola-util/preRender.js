module.exports = function preRender ({ context, plugins }) {
  const handlers = plugins.filter(p => p.preRender).map(p => p.preRender)

  return handlers.reduce((data, handler) => {
    try {
      data = Object.assign(data, handler({ context }))
    } catch (e) {
      console.error(`preRender failed`)
      console.error(e)
    }

    return data
  }, {})
}
