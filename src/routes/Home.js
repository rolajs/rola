/** @jsx h */
import { h } from 'ultradom'
import { route } from 'foil'

function Home (props) {
  return (
    <h1>Hello world!</h1>
  )
}

export default route({
  path: '/',
  payload: {
    Component: Home
  }
})
