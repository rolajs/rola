import tags from 'html-meta-tags'
import { stringify } from 'flatted/cjs'

export default function html ({ state, view }) {
  const meta = state.meta || {}

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>

        <title>${meta.title || 'yep'}</title>

        <link rel='stylesheet' href='/client.css' />

        ${tags(meta)}
      </head>

      <body>
        <div id='root'>${view}</div>

        <script>
          window.__yepyep = ${stringify(state)}
        </script>
        <script src='/client.js'></script>
      </body>
    </html>
  `
}