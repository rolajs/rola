const defaultHead = [
  ['viewport', `<meta name='viewport' content='width=device-width,initial-scale=1'>`]
]

const defaultBody = []

module.exports = function createDocument ({
  plugins,
  context,
  head = [],
  body = [],
  ...customProps
}) {
  const handlers = plugins.filter(p => p && p.createDocument).map(p => p.createDocument)

  const headTags = new Map()
  const bodyTags = new Map()

  const processed = handlers.map(handler => handler({ context, ...customProps }))

  processed.forEach((data = {}) => {
    defaultHead
      .concat(head)
      .concat(data.head || []).forEach(line => {
        let [ val, key ] = [].concat(line).reverse()

        key = key || val

        headTags.set(key, val)
      })

    defaultBody
      .concat(body)
      .concat(data.body || []).forEach(line => {
        let [ val, key ] = [].concat(line).reverse()

        key = key || val

        bodyTags.set(key, val)
      })
  })

  return {
    head: Array.from(headTags.values()),
    body: Array.from(bodyTags.values())
  }
}
