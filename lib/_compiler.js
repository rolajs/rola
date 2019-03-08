const fs = require('fs-extra')
const path = require('path')
const compiler = require('@friendsof/spaghetti')

const cwd = process.cwd()

function createConfig ({ filename, watch }) {
  const client = filename === 'client'

  return {
    in: path.join(cwd, `${filename}.js`),
    filename,
    outDir: path.join(cwd, 'static'),
    alias: {
      '@': cwd
    },
    watch,
    target: client ? 'web' : 'node',
    output: client ? {} : {
      library: '__hypr_internal',
      libraryTarget: 'commonjs2'
    },
    banner: client ? `` : `require('source-map-support').install();`
  }
}

function createCompilers (opts = {}) {
  let clientConfig
  let clientCompiler
  let serverConfig
  let serverCompiler

  const clientEntry = path.join(cwd, 'client.js')
  const serverEntry = path.join(cwd, 'server.js')

  if (fs.existsSync(clientEntry)) {
    clientConfig = createConfig({
      filename: 'client',
      watch: opts.watch
    })
    clientCompiler = compiler(clientConfig)
  }

  if (fs.existsSync(serverEntry)) {
    serverConfig = createConfig({
      filename: 'server',
      watch: opts.watch
    })
    serverCompiler = compiler(serverConfig)
  }

  return {
    client: {
      config: clientConfig,
      compiler: clientCompiler
    },
    server: {
      config: serverConfig,
      compiler: serverCompiler
    }
  }
}

module.exports = {
  compiler,
  createCompilers
}
