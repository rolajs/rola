const tags = require('html-meta-tags')
const { stringify } = require('flatted/cjs')

module.exports = function html ({ head, body, view, context }) {
  const { state } = context
  const meta = state.meta || {}

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${meta.title || 'rola'}</title>
        ${head.join('')}
        ${tags(meta)}
        <link rel='stylesheet' href='/client.css' />
      </head>

      <body>
        <div id='root'>${view}</div>
        ${body.join('')}
        <script>
          window.__rola = ${stringify(context)}
        </script>
        <script src='/client.js'></script>
      </body>
    </html>
  `
}
