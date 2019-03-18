import { parse, match, exec } from 'matchit'

export default function matcher (routes, redirects = []) {
  const matchers = routes.map(route => parse(route[0]))
  const dictionary = routes.reduce((dict, route) => {
    dict[route[0]] = route[1]
    return dict
  }, {})

  return function route (path) {
    const m = match(path, matchers)

    if (!m.length) return []

    return [
      dictionary[m[0].old],
      exec(path, m)
    ]
  }
}
