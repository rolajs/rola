import React from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

const sheets = new Map()

export default [
  {
    createDocument ({ context }) {
      head: context.style
    },
    createRoot ({ root: Root, context }) {
      const sheet = new ServerStyleSheet()

      sheets.set(context.pathname, sheet)

      return props => <StyleSheetManager sheet={sheet.instance}><div id='taco'><Root {...props} /></div></StyleSheetManager>
    },
    postRender ({ context }) {
      const sheet = sheets.get(context.pathname)

      if (!sheet) return {}

      const style = sheet.getStyleTags()

      sheet.seal()
      sheets.delete(context.pathname)

      return { style }
    }
  }
]
