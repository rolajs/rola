![repo-banner](https://user-images.githubusercontent.com/4732330/54318359-74f6a480-45bc-11e9-8548-d7b12b08257f.png)

```
npm i hypr -g
```
<br />
<br />

> This project is *beta*. I welcome all ideas, critiques, and PRs :)

<br />

## features
- server rendering
- static rendering
- client-side application
- css compilation
- routing
- state management

## usage
```
hypr build
```
```
hypr watch
```

## setup

**routes/Home.js**
```javascript
import React from 'react'

export const pathname = '/'
export function view (props) {
  return <h1>{props.title}</h1>
}
```

**routes.js**
```javascript
import React from 'react'
import Home from '@routes/Home.js'

export default [ Home ]
```

**client.js**
```javascript
import React from 'react'
import { client } from 'hypr'
import routes from '@routes.js'

client(routes, { title: 'hello world' })(document.getElementById('root'))
```

**server.js**
```javascript
import React from 'react'
import { server } from 'hypr'
import routes from '@routes.js'

export default server(routes, { title: 'hello world' })
```

## static
To render a route statically, define a `config()` for [biti](https://github.com/estrattonbailey/biti).

**routes/Home.js**
```javascript
import React from 'react'

export const pathname = '/'
export function config () {
  return {
    props: { title: 'homepage' }
  }
}
export function view (props) {
  return <h1>{props.title}</h1>
}
```

## data loading
A `load()` export will be resolved on both the server and client before
rendering the view.

During a static render, load is not called, so you might want to re-purpose it
for static rendering as well. Or a combo thereof.

**routes/Home.js**
```javascript
import React from 'react'

export const pathname = '/'
export function config () {
  return load()
}
export function load (state, req) {
  return {
    props: { title: 'loaded title' }
  }
}
export function view (props) {
  return <h1>{props.title}</h1>
}
```

## routing
`hypr` comes with routing built in. Use the `Link` export to navigate throughout
your app.

**routes/Home.js**
```javascript
import React from 'react'
import { Link } from 'hypr'

export const pathname = '/'
export function config () {
  return load()
}
export function load (state, req) {
  return {
    props: { title: 'loaded title' }
  }
}
export function view (props) {
  return (
    <>
      <h1>{props.title}</h1>

      <nav>
        <Link href='/'>home</Link>
        <Link href='/about'>about</Link>
      </nav>
    </>
  )
}
```

## state
`hypr` comes with state management built in also. Use the `withState` export to
pass state to individual components. Refer to the
[picostate](https://github.com/estrattonbailey/picostate) docs for more info.

**routes/Home.js**
```javascript
import React from 'react'
import { Link, withState } from 'hypr'

export const pathname = '/'
export function config () {
  return load()
}
export function load (state, req) {
  return {
    props: { title: 'loaded title' }
  }
}
export withState(state => ({
  myTitle: state.title
}))(
  function view (props) {
    return (
      <>
        <h1>{props.myTitle}</h1>

        <button onClick={() => {
          props.hydrate({ title: 'new title' })()
        }}>update title</button>

        <nav>
          <Link href='/'>home</Link>
          <Link href='/about'>about</Link>
        </nav>
      </>
    )
  }
)
```

## roadmap
- lambda function support

## motivation
This will be a blog post, but think *[Next](https://nextjs.org/) plus [Gatsby](https://www.gatsbyjs.org/).*

## contributing
Wowee would I welcome some help :)

## the name
Massive thanks to [idmitriev](https://github.com/idmitriev) for passing on the
name, very kind of them :)

## license
MIT &copy; 2019 Eric Bailey
