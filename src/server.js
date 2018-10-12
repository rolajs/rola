/** @jsx h */
import { h } from 'preact'
import renderToString from 'preact-render-to-string'
import connect from 'connect'
import router from 'router'
import serve from 'serve-static'
import comp from 'compression'
import ms from 'ms'
import createStore from 'picostate'
import { router as foil } from 'foil'
import metaTags from 'html-meta-tags'
import { withRender } from '@hyperapp/render'
import routes from './routes.js'
import App from './App.js'

const { NODE_ENV } = process.env

const PRODUCTION = NODE_ENV === 'production'
const STAGING = NODE_ENV === 'staging'

const server = connect()
const serverRouter = router()

PRODUCTION && server.use(comp())

server.use(serve('public', {
  maxAge: PRODUCTION ? ms('1d') : 0
}))

function handleRedirect (res, redirect) {
  res.writeHead(302, {
    Location: redirect.to,
    Referer: redirect.from
  })
  res.end()
}

serverRouter.get('*', (req, res) => {
  const store = createStore({})
  const meta = createStore({})

  const app = foil(routes, { store })

  function render (url, statusCodeOverride) {
    app.resolve(url, ({ payload, context, redirect }) => {
      if (redirect.to) return handleRedirect(res, redirect)

      res.statusCode = statusCodeOverride || 200

      const maxAge = payload.cacheControl ? (
        PRODUCTION ? ms(payload.cacheControl) : 1000
      ) : (
        ms('1hr')
      )

      /**
       * If response should be cachable,
       * create a transform stream to pipe
       * to instead of the default response
       */
      res.setHeader(
        'Cache-Control',
        payload.cacheControl ? (
          `public, max-age=${maxAge}`
        ) : (
          `no-cache, no-store, must-revalidate`
        )
      )

      /**
       * Load route data fetcher and then render
       */
      Promise.resolve(
        payload.load && payload.ssr !== false ? payload.load(context) : true
      ).then(async data => {
        const { redirect = {}, statusCode = res.statusCode } = data || {}

        res.writeHead(statusCode, { 'Content-Type': 'text/html' })

        if (redirect.to) handleRedirect(res, redirect)

        const { Component } = payload

        const headTags = metaTags(meta.state)

        const Markup = (
          <App>
            <Component />
          </App>
        )

        console.log(Markup)

        res.write(`<!doctype html>
          <html>
            <head>
              <meta charset="utf-8"/>
              <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <link rel="icon" type="image/x-icon" href="/static/favicon.png" />
              <title>${meta.state.title}</title>
              ${headTags}
              ${PRODUCTION || STAGING ? `<link rel='stylesheet' href='/main.css?v=${pkg.version}' />` : ''}
              <script>
                window.__hydrate__ = {
                  store: ${JSON.stringify(store.state)},
                  meta: ${JSON.stringify(meta.state)}
                }
              </script>
              <script src="${PRODUCTION || STAGING ? `/index.js?v=${pkg.version}` : 'http://localhost:8080/index.js'}" defer></script>
            </head>
            <body>
              <div id='root'>${renderToString(Markup)}</div>
              <script src='https://clare-dev.myshopify.com/services/countries.js' defer></script>
            </body>
          </html>`
        )

        res.end()
      }).catch(e => {
        console.error(
          `${url} - render`,
          e.message || e,
          e
        )
      })
    })
  }

  render(req.originalUrl)
})

server.use(serverRouter)

export default server
