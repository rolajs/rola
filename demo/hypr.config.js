const path = require('path')

module.exports = ({ client, production }) => ({
  outDir: client ? path.resolve('static') : path.resolve(__dirname),
  filename: 'index',
  in: path.resolve(client ? 'client.js' : 'server.js')
})
