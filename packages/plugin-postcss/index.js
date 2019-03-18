const ExtractCSS = require('mini-css-extract-plugin')

module.exports = (options = {}) => (config, ctx) => {
  config.module.rules.push({
    test: /\.css$/,
    exclude: /node_modules/,
    use: [
      ExtractCSS.loader,
      require.resolve('css-loader'),
      {
        loader: require.resolve('postcss-loader'),
        options: {
          plugins: [
            require('postcss-import'),
            require('postcss-nested'),
            require('postcss-cssnext')({
              warnForDuplicates: false,
              warnForDeprecations: false
            }),
            require('postcss-discard-comments'),
            ctx.watch && require('cssnano')
          ].filter(Boolean)
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
