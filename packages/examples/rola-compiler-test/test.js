const compiler = require('@rola/compiler')

const app = compiler([
  {
    in: './client.js',
    out: './build',
    plugins: [
      require('@rola/plugin-postcss')()
    ]
  },
  {
    in: './server.js',
    out: './build',
    plugins: [
      require('@rola/plugin-node')()
    ]
  },
  {
    in: './routes/*.js',
    out: './build/routes',
    plugins: [
      require('@rola/plugin-node')()
    ]
  }
])

app.on('error', e => console.error(e))
app.on('stats', stats => console.log(JSON.stringify(stats, null, '  ')))

// app.watch()
app.build()
