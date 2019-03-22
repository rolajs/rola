/**
 * unused
 */
const fs = require('fs-extra')
const path = require('path')
const assert = require('assert')
const transpile = require('./transpile.js')

module.exports = function transpileAndGetModule (file, outDir, options = {}) {
  if (outDir) {
    assert(path.isAbsolute(outDir), 'outDir needs to be an absolute path')
  } else {
    outDir = path.join(path.dirname(file), '.cache')
  }

  try {
    const out = path.join(outDir, path.basename(file))

    const code = transpile(file, options)

    fs.outputFileSync(out, code)

    const mod = require(out)

    fs.removeSync(out)

    return mod
  } catch (e) {
    if (!options.quiet) {
      console.error(`transpileAndGetModule for ${file} failed`)
      console.error(e)
    }
    return {}
  }
}
