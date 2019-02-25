# hypr
The complete React toolkit.

### Features
1. Server rendering +
2. Static rendering +
3. Client-side bundle +
4. CSS via PostCSS

## Usage
```javascript
// client.js
import React from 'react'
import { client } from 'hypr/client'

const routes = [
  {
    pathname: '/',
    view (props) {
      return <h1>Hello world</h1>
    }
  }
]

const initialState = {}

client(routes, initialState)(document.getElementById('root'))
```
```javascript
// server.js
import React from 'react'
import { server } from 'hypr/server'

const routes = [
  {
    pathname: '/',
    view (props) {
      return <h1>Hello world</h1>
    }
  }
]

const initialState = {}

export default (req, res) => server(routes, initialState)(req, res)
```

### Exports
```javascript
import { server } from 'hypr/server'
import { client } from 'hypr/client'
import { withHistory, history } from 'hypr/history'
import { withState, store } from 'hypr/history'
import Link from 'hypr/link'
```
