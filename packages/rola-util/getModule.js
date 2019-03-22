const fs = require('fs-extra')
const path = require('path')
const assert = require('assert')
const { transformSync } = require('@babel/core')

function transpile (file, outDir, options = {}) {
  if (outDir) {
    assert(path.isAbsolute(outDir), 'outDir needs to be an absolute path')
  } else {
    outDir = path.join(path.dirname(file), '.cache')
  }

  try {
    const out = path.join(outDir, path.basename(file))

    const { code } = transformSync(fs.readFileSync(file), {
      plugins: [
        require.resolve('@babel/plugin-syntax-object-rest-spread'),
        require.resolve('@babel/plugin-proposal-class-properties'),
        require.resolve('fast-async'),
        [require.resolve('babel-plugin-module-resolver'), {
          alias: {
            '@': process.cwd(),
            ...(options.alias || {})
          }
        }]
      ],
      presets: [
        require.resolve('@babel/preset-env'),
        require.resolve('@babel/preset-react')
      ]
    })

    fs.outputFileSync(out, code)

    const mod = require(out)

    fs.removeSync(out)

    return mod
  } catch (e) {
    if (!options.quiet) {
      console.error(`getModule for ${file} failed`)
      console.error(e)
    }
    return {}
  }
}

module.exports = function getModule (file, outDir) {
  const { alias } = transpile(path.join(process.cwd(), 'rola.config.js'), null, { quiet: true })

  assert(path.isAbsolute(file), 'file needs to be an absolute path')

  return transpile(file, outDir, { alias })
}
