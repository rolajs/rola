module.exports = function postRender ({ context, plugins }) {
  const handlers = plugins.filter(p => p.postRender).map(p => p.postRender)

  return handlers.reduce((data, handler) => {
    try {
      data = Object.assign(data, handler({ context }))
    } catch (e) {
      console.error(`postRender failed`)
      console.error(e)
    }

    return data
  }, {})
}
