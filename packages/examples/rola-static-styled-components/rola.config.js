import React from 'react'
import document from '@rola/plugin-document'
import styledComponents from '@rola/plugin-styled-components'

export default {
  plugins: [
    document(({ context, view }) => {
      return `<!DOCTYPE html>
        <html>
          <head>
            ${context.style}
          </head>
          <body>
            ${view}
          </body>
        </html>
      `
    }),
    styledComponents()
  ]
}
