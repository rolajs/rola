const compiler = require('@rola/compiler')

const app = compiler([
  {
    in: './client.js',
    out: './build',
    presets: [
      require('@rola/preset-postcss')()
    ]
  },
  {
    in: './server.js',
    out: './build',
    presets: [
      require('@rola/preset-node')()
    ]
  },
  {
    in: './routes/*.js',
    out: './build/routes',
    preset: [
      require('@rola/preset-node')()
    ]
  }
])

app.on('error', e => console.error(e))
app.on('stats', stats => console.log(JSON.stringify(stats, null, '  ')))

// app.watch()
app.build()
