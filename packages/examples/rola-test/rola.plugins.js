import React from 'react'

export default [
  {
    createDocument ({ context }) {
      return {
        head: context.style
      }
    },
    postRender ({ context }) {
      return {
        style: [`<link rel='stylesheet' />`]
      }
    },
    // preRender ({ context }) {
    //   return {
    //     style: `<link rel='stylesheet' />`
    //   }
    // }
  }
]
