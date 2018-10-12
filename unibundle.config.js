const path = require('path')
const webpack = require('webpack')

const { NODE_ENV } = process.env

const PRODUCTION = NODE_ENV === 'production'
const STAGING = NODE_ENV === 'staging'

const alias = {
  'components': path.resolve('./src/components'),
  'routes': path.resolve('./src/routes'),
  'state': path.resolve('./src/state'),
  'actions': path.resolve('./src/actions'),
  'lib': path.join(__dirname, './src/lib'),
  'src': path.resolve('./src')
}

const env = new webpack.DefinePlugin({
  'PRODUCTION': PRODUCTION,
  'STAGING': STAGING
})

module.exports = production => ({
  buildDir: 'build',
  publicDir: 'public',
  css: {
    output: {
      filename: 'main.css'
    }
  },
  client: {
    entry: 'src/client.js',
    output: {
      filename: 'index.js'
    },
    alias,
    plugins: [ env ]
  },
  server: {
    entry: 'src/index.js',
    output: {
      filename: 'server.js'
    },
    alias,
    plugins: [ env ]
  }
})
