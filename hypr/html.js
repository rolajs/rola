module.exports = function (state, meta, view) {
  return `
    <!DOCTYPE html>
    <html lang='en'>
      <head>
        <script>console.log('so nice')</script>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon.png">
        <link rel='canonical' href='so-nice.site'>
        <title>${meta.title}</title>
        ${require('html-meta-tags')(meta)}
      </head>

      <body>
        <div id='root'>${view}</div>
        <script>
          window.__hypr = ${JSON.stringify(state)}
        </script>
      </body>
    </html>
  `
}
