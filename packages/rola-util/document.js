const tags = require('html-meta-tags')
const { stringify } = require('flatted/cjs')

module.exports = function html ({ head = [], body = [], view, context }) {
  const { state } = context
  const meta = state.meta || {}

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${meta.title || 'rola'}</title>
        ${head.join('')}
        ${tags(meta)}
      </head>

      <body>
        <div id='root'>${view}</div>
        <script>
          window.__rola = ${stringify(context)}
        </script>
        ${body.join('')}
      </body>
    </html>
  `
}
