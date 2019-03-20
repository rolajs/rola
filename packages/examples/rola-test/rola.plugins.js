import React from 'react'

export default [
  {
    createRoot ({ app, context }) {
      return props => (
        <div className='taco'>{app}</div>
      )
    }
  }
]
