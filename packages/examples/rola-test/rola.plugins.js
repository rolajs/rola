import React from 'react'

export default [
  {
    wrapApp ({ app, context }) {
      return props => (
        <div className='taco'>{app}</div>
      )
    }
  }
]
