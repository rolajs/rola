![repo banner](https://user-images.githubusercontent.com/4732330/54318360-74f6a480-45bc-11e9-8d5c-20c99e6a586b.png)

```bash
npm i biti -g
```

<br />
<br />

> 👀 Looking for a static page generation *plus* a client-side app? Try 👉 [hypr](https://github.com/estrattonbailey/hypr) :)

<br />

## Features
- easy static page generation
- intelligent file watching
- convenient CLI
- easy Node API

## Usage
```bash
biti watch pages/ static/
```

## Getting started
`biti` is pretty simple. It operates on a single directory of pages, which each
define and export properties and methods that `biti` uses to render the page.

For the examples here, we'll use `/pages` as our pages directory, but you could
call it anything.

#### Configuring a page
Each page requires the following exports:
- `pathname` - string - the path where you'd like the page to appear
- `view` - function - a function that returns a React component

The pathname property will be passed to the `view` component.

An simple page might look like this:

```javascript
import React from 'react'

export const pathname = '/about'

export function view ({ pathname }) {
  return (
    <>
      <h1>About Us</h1>
      <p>...</p>
    </>
  )
}
```

#### Static data
Pages can also export a `state` object, which will also be passed to the `view`
function when rendering.

```javascript
import React from 'react'

export const pathname = '/about'

export const state = {
  title: 'About Us',
  description: '...'
}

export function view ({ state, pathname }) {
  return (
    <>
      <h1>{state.title}</h1>
      <p>{state.description}</p>
    </>
  )
}
```

#### Loading data
Routes that require data or those that need dynamic properties can define a
`config` function that *returns* a page config containing the same properties
listed above.

These values will be *deeply merged* with whatever static exports were provided.

```javascript
import React from 'react'
import { getAboutPage } from './lib/api.js'

export const pathname = '/about'

export const state = {
  title: 'About Us',
  team: [
    'Eric'
  ]
}

export function config () {
  return getAboutPage()
    .then(res => {
      return {
        state: {
          team: res.team
        }
      }
    })
}

export function view ({ state, pathname }) {
  return (
    <>
      <h1>{state.title}</h1>

      <h2>Team</h2>

      {state.team.map(name => (
        <p key={name}>{name}</p>
      ))}
    </>
  )
}
```

#### Generating pages from loaded data
For generative pages and pagination, the `config` function *can also return an
array of page configs*. Each of these configs should define its own `pathname`,
so that each page is rendered separately.

The following example will generate a page for each post returned from
`getBlogPosts`:

```javascript
import React from 'react'
import { getBlogPosts } from './lib/api.js'

export function config () {
  return getBlogPosts()
    .then(posts => {
      return posts.map(post => ({
        pathname: `/posts/${post.slug}`,
        state: {
          title: post.title,
          content: post.content
        }
      }))
    })
}

export function view ({ state, pathname }) {
  return (
    <>
      <h1>{state.title}</h1>

      <article>
        {state.content}
      </article>
    </>
  )
}
```

## Configuration
`biti` supports minimal configuration, and otherwise falls back to smart
defaults. To define a config for all rendering tasks, you can create a
`biti.config.js` file.

`biti` supports the following properties on the config file:
- `env` - object - properties on this object will be attached to `process.env`,
  as well as defined *globally* within the compilation.
- `alias` - object - module import aliases

Example:
```javascript
module.exports = {
  env: {
    API_KEY: 'abcdefg'
  },
  alias: {
    components: './src/components'
  }
}
```

#### Default config
By default, `biti` defines a single alias `@` that points to `process.cwd()`.
You can use it throughout your templates like this:

```javascript
import Component from '@/src/components/Component.js'
```

## CLI
`biti` only has two commands: `render` and `watch`.

Both follow the same pattern:

```bash
biti <command> <src> <dest>
```

For example:

```bash
biti render /pages /static
```

These commands also accept globs as the `src` property, allowing you to specify
individual pages or directories.

```bash
biti render /pages/about-us.js /static
biti render /pages/*.js /static
biti render /pages/marketing-site/*.js /static
biti render /pages/**/*.js /static
```

## API
Using `biti` programmatically is virtually the same as using the CLI, only
you'll need to pass your configuration object manually.

```javascript
const biti = require('biti')

const config = {
  env: { ... },
  alias: { ... }
}

const app = biti(config)
```

Both `render` and `watch` have the following signature:

```javascript
app.render(src, dest)
```

#### render
Renders all pages from `src` `dest`.

```javascript
app.render('/src', '/static')
```

#### watch
Watches all pages in `src` and renders to `dest` on file change.

```javascript
app.watch('/src', '/static')
```

### API Events
A `biti` instance emits a few helpful events as well.

#### render
After rendering a single page.
```javascript
app.on('render', page => {})
```

#### rendered
After rendering all pages. On watch this is called after every change has been
compiled and rendered.
```javascript
app.on('rendered', pages => {})
```

#### error
```javascript
app.on('error', error => {})
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)
