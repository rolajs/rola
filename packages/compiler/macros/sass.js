const ExtractCSS = require('mini-css-extract-plugin')

module.exports = (options = {}) => (config, ctx) => {
  config.module.rules.push({
    test: /\.(sa|sc)ss$/,
    exclude: /node_modules/,
    use: [
      ExtractCSS.loader,
      require.resolve('css-loader'),
      {
        loader: require.resolve('sass-loader'),
        options: {
          implementation: require('sass')
        }
      }
    ]
  })

  config.plugins.push(
    new ExtractCSS({
      filename: options.filename || '[name].css'
    })
  )

  return config
}
