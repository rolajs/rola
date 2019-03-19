const fs = require('fs-extra')
const path = require('path')
const { transformSync } = require('@babel/core')
const log = require('@rola/log')

module.exports = async function getConfig () {
  const cwd = process.cwd()

  try {
    const infile = path.resolve(cwd, './rola.config.js')
    const outfile = path.join(cwd, '.cache', 'rola.config.js')

    if (!infile) return {}

    const { code } = transformSync(fs.readFileSync(infile), {
      plugins: [
        require.resolve('@babel/plugin-syntax-object-rest-spread'),
        require.resolve('@babel/plugin-proposal-class-properties'),
        require.resolve('fast-async')
      ],
      presets: [
        require.resolve('@babel/preset-env'),
        require.resolve('@babel/preset-react')
      ]
    })

    fs.outputFileSync(outfile, code)

    return require(outfile).default
  } catch (e) {
    log(state => ({ error: state.error.concat(e) }))
    return {}
  }
}
