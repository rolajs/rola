import React from 'react'
import document from '@rola/plugin-document'

export default {
  plugins: [
    document(({ state, view }) => {
      return `<!DOCTYPE html>${view}`
    })
  ]
}
