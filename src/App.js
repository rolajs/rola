/** @jsx h */
import { h } from 'ultradom'

export default function App (props) {
  console.log('props', props)
  return (
    <main>
      {props.children}
    </main>
  )
}
