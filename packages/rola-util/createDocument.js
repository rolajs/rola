const defaultHead = [
  ['viewport', `<meta name='viewport' content='width=device-width,initial-scale=1'>`]
]

const defaultBody = []

module.exports = function createDocument ({ plugins, context, ...customProps }) {
  const handlers = plugins.filter(p => p && p.createDocument).map(p => p.createDocument)

  const head = new Map()
  const body = new Map()

  const processed = handlers.map(handler => handler({ context, ...customProps }))

  processed.forEach((data = {}) => {
    defaultHead.concat(data.head || []).forEach(line => {
      let [ val, key ] = [].concat(line).reverse()

      key = key || val

      head.set(key, val)
    })

    defaultBody.concat(data.body || []).forEach(line => {
      let [ val, key ] = [].concat(line).reverse()

      key = key || val

      body.set(key, val)
    })
  })

  return {
    head: Array.from(head.values()),
    body: Array.from(body.values())
  }
}
