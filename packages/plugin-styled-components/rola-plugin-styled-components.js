/** @jsx React.createElement*/
import React from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

const sheets = new Map()

export default (options = {}) => {
  return {
    // createConfig ({ config, context }) {
    //   config.module.rules[0].use[0].options.plugins.push([
    //     'babel-plugin-styled-components',
    //     { ssr: true }
    //   ])
    // },
    wrapApp ({ app, context }) {
      const sheet = new ServerStyleSheet()

      sheets.set(context.pathname, sheet)

      return <StyleSheetManager sheet={sheet.instance}>{app}</StyleSheetManager>
    },
    appDidRender ({ context }) {
      const sheet = sheets.get(context.pathname)

      if (!sheet) return {}

      const style = sheet.getStyleElement()

      sheet.seal()
      sheets.delete(context.pathname)

      return { style }
    }
  }
}
