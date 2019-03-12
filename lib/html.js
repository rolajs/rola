import tags from 'html-meta-tags'
import { stringify } from 'flatted/cjs'

export default function html ({ state, meta = {}, view }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>

        <title>${meta.title}</title>

        <link rel='stylesheet' href='/client.css' />

        ${tags(meta)}
      </head>

      <body>
        <div id='root'>${view}</div>

        <script>
          window.__hypr = ${stringify(state)}
        </script>
        <script src='/client.js'></script>
      </body>
    </html>
  `
}
