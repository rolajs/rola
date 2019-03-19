import React from 'react'

export default {
  plugins: [
    {
      createDocument ({ state, view }) {
        return `<!DOCTYPE html>${view}`
      },
      onStaticRender ({ component, state }) {
        return component
      }
    }
  ]
}
