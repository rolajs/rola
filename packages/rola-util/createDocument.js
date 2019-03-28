const defaultHead = [
  ['viewport', `<meta name='viewport' content='width=device-width,initial-scale=1'>`]
]

const defaultBody = []

module.exports = function createDocument ({
  plugins = [],
  context,
  head = [],
  body = [],
  ...customProps
}, debug) {
  const handlers = plugins.filter(p => p && p.createDocument).map(p => p.createDocument)

  const headTags = new Map()
  const bodyTags = new Map()

  const processed = handlers.map(handler => handler({ context, ...customProps }))

  const processedHead = processed.filter(data => data.head).map(data => data.head)
  const processedBody = processed.filter(data => data.body).map(data => data.body)

  defaultHead
    .concat(processedHead)
    .concat(head)
    .forEach(line => {
      let [ val, key ] = [].concat(line).reverse()

      key = key || val

      headTags.set(key, val)
    })

  defaultBody
    .concat(processedBody)
    .concat(body)
    .forEach(line => {
      let [ val, key ] = [].concat(line).reverse()

      key = key || val

      bodyTags.set(key, val)
    })

  return {
    head: Array.from(headTags.values()),
    body: Array.from(bodyTags.values())
  }
}
