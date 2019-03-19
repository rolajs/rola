import React from 'react'
import document from '@rola/plugin-document'
import styledComponents from '@rola/plugin-styled-components'

export default {
  plugins: [
    document(({ state, view, style }) => {
      return `<!DOCTYPE html>
        <html>
          <head>
            ${style}
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
