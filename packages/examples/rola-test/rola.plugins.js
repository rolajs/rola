import React from 'react'

export default [
  {
    createDocument ({ context }) {
      return {
        head: [
          ['viewport', `<meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no'>`]
        ],
        body: [
          '<script></script>'
        ]
      }
    },
    createRoot ({ app, context }) {
      return props => (
        <div className='taco'>{app}</div>
      )
    }
  }
]
