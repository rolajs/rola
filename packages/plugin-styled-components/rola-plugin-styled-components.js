/** @jsx React.createElement*/
import React from 'react'
import { ServerStyleSheet } from 'styled-components'

const sheets = new Map()

export default (options = {}) => {
  return {
    createConfig ({ config, context }) {
      confing.plugins.push('babel-plugin-styled-components')
    },
    wrapApp ({ component, context }) {
      const sheet = new ServerStyleSheet()

      sheets.set(context.pathname, sheet)

      return sheet.collectStyles(component)
    },
    appDidRender ({ context }) {
      const sheet = sheets.get(context.pathname)

      if (!sheet) return {}

      const style = sheet.getStyleTags()

      sheet.seal()

      return { style }
    }
  }
}
