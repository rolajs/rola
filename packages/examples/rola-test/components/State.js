import React from 'react'
import { withState } from 'hypr/state'

export default withState(state => state)(
  class ComponentWithState extends React.Component {
    componentDidMount () {
      console.log('state', this.props)
    }

    render () {
      return null
    }
  }
)
