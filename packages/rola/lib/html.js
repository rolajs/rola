import tags from 'html-meta-tags'
import { stringify } from 'flatted/cjs'

export default function html ({ context, view }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>

        <title>rola</title>

        <link rel='stylesheet' href='/client.css' />
      </head>

      <body>
        <div id='root'>${view}</div>

        <script>
          window.__rola = ${stringify(context)}
        </script>
        <script src='/client.js'></script>
      </body>
    </html>
  `
}
