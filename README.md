![repo-banner](https://user-images.githubusercontent.com/4732330/54534195-3cf7b480-4962-11e9-87bf-f04e83f61198.png)

```
npm i rola -g
```
<br />
<br />

> This project is *alpha*, so I don't recommend using it in production *yet*. I
> welcome all ideas, critiques, and PRs :)

<br />

## features
- static page generation
- server side rendering
- client-side application bundle
- css compilation w/ PostCSS
- routing
- state management
- builds to lambda function
- "hello world" 50kb gzipped
- pick and choose build type
  - client + static
  - static + SSR
  - SSR + API
  - SSR + client
  - static
  - etc

## beta roadmap
- production server for non lambda envs
- prefetch route API
- plugins
  - think like better css-in-js support, sass, babel config, etc
- named 404.html support

## usage
```
rola build
```
```
rola watch
```

## setup

**routes/Home.js**
```javascript
import React from 'react'

export const pathname = '/'
export function view () {
  return <h1>Hello World</h1>
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
import { client } from 'rola'
import routes from '@routes.js'

client(routes, { title: 'hello world' })(document.getElementById('root'))
```

**server.js**
```javascript
import React from 'react'
import { server } from 'rola'
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
    state: { title: 'homepage' }
  }
}
export function view ({ state }) {
  return <h1>{state.title}</h1>
}
```

## data loading
A `load()` export will be resolved on both the server and client before
rendering the view. The returned object should match
[biti](https://github.com/estrattonbailey/biti) API as well. Any props on the
`state` object returned will be merged with application state.

During a static render, `load` is not called.

**routes/Home.js**
```javascript
import React from 'react'

export const pathname = '/'
export function config () {
  return load()
}
export function load (state, req) {
  return {
    state: { title: 'loaded title' }
  }
}
export function view ({ state }) {
  return <h1>{state.title}</h1>
}
```

## routing
`rola` comes with routing built in. Use the `Link` export to navigate throughout
your app.

**routes/Home.js**
```javascript
import React from 'react'
import { Link } from 'rola'

export const pathname = '/'
export function config () {
  return load()
}
export function load (state, req) {
  return {
    state: { title: 'loaded title' }
  }
}
export function view ({ state }) {
  return (
    <>
      <h1>{state.title}</h1>

      <nav>
        <Link href='/'>home</Link>
        <Link href='/about'>about</Link>
      </nav>
    </>
  )
}
```

## state
`rola` comes with state management built in also. Use the `withState` export to
pass state to individual components. Refer to the
[picostate](https://github.com/estrattonbailey/picostate) docs for more info.

**components/ChangeTitle.js**
```javascript
import React from 'react'
import { withState } from 'rola'

export default withState(state => ({
  myTitle: state.title
}))(
  function ChangeTitle ({ myTitle, hydrate }) {
    return (
      <button onClick={() => {
        hydrate({ title: 'new title' })()
      }}>update title</button>
    )
  }
)
```
**routes/Home.js**
```javascript
import React from 'react'
import { Link, withState } from 'rola'
import ChangeTitle from '@/components/ChangeTitle.js'

export const pathname = '/'
export function config () {
  return load()
}
export function load (state, req) {
  return {
    state: { title: 'loaded title' }
  }
}
export function view ({ state }) {
  return (
    <>
      <h1>{state.myTitle}</h1>

      <ChangeTitle />

      <nav>
        <Link href='/'>home</Link>
        <Link href='/about'>about</Link>
      </nav>
    </>
  )
}
```

## motivation
This will be a blog post, but think *[Next](https://nextjs.org/) plus [Gatsby](https://www.gatsbyjs.org/).*

## contributing
Wowee would I welcome some help :)

## license
MIT License © [Eric Bailey](https://estrattonbailey.com)
