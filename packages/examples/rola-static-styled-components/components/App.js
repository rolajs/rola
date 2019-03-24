import React from 'react'
import { Link } from 'rola'

export default function App (props) {
  return (
    <>
      <nav>
        <Link href='/'>/</Link><br />
        <Link href='/about'>/about</Link><br />
        <Link href='/whoops'>/whoops</Link>
      </nav>

      <div>
        {props.children}
      </div>
    </>
  )
}
