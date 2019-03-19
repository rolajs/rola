import React from 'react'
import { withHistory } from 'hypr/history'

export default withHistory(
  class ComponentWithHistory extends React.Component {
    componentDidMount () {
      console.log('history', this.props)
    }

    render () {
      return null
    }
  }
)
