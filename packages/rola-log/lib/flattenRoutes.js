/**
 * @see https://repl.it/@estrattonbailey/route-flattener
 */

function normalize (path) {
  return /^\//.test(path) ? path : '/' + path
}

module.exports = function flatten (routes) {
  let output = new Set()
  let groups = new Set()

  for (let i = routes.length - 1; i > -1; i--) {
    const parts = routes[i].split(/\//).filter(Boolean)

    if (parts.length <= 1) {
      output.add(normalize(parts[0] || '/'))
      routes.splice(i, 1)
      continue
    }

    for (let i = 0; i < parts.length; i++) {
      groups.add(parts.slice(0, i).join('/'))
    }
  }

  for (let path of Array.from(groups.values()).filter(Boolean).reverse()) {
    let matches = []

    for (let i = routes.length - 1; i > -1; i--) {
      if (routes[i].indexOf(path) > -1) {
        matches.push(normalize(routes[i]))
        routes.splice(i, 1)
      }
    }

    if (matches.length > 1) {
      output.add([ normalize(path), matches.length ])
    } else {
      output.add(matches[0])
    }
  }

  return Array.from(output.values())
}
