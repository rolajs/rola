module.exports = function postServerRender ({ context, plugins }) {
  const handlers = plugins.filter(p => p && p.postServerRender).map(p => p.postServerRender)

  return handlers.reduce((data, handler) => {
    try {
      data = Object.assign(data, handler({ context }))
    } catch (e) {
      console.error(`postServerRender failed`)
      console.error(e)
    }

    return data
  }, {})
}
