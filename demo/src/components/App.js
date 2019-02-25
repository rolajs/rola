import React from 'react'
import Link from 'hypr/link'
import History from '@/src/components/History.js'
import State from '@/src/components/State.js'

export default function App (props) {
  return (
    <div>
      <nav>
        <Link href='/'>/</Link><br />
          <Link href='/about'>/about</Link><br />
        <Link href='/whoops'>/whoops</Link>
      </nav>

      <History />
      <State />

      <div>
        {props.children}
      </div>
    </div>
  )
}
