import React from 'react'
import { renderToString } from 'react-dom/server'
import createStore from 'picostate'
import matcher from './matcher.js'
import Hypr from './Hypr.js'

import plugins from '@/rola.plugins.js'

const doc = require('@rola/util/document.js')
const createDocument = require('@rola/util/createDocument.js')
const createRoot = require('@rola/util/createRoot.js')
const postRender = require('@rola/util/postRender.js')
const preRender = require('@rola/util/preRender.js')

export default function createStatic (view) {
  return function StaticComponent (context) {
    const View = createRoot({
      root: view,
      context: { ...context },
      plugins
    })

    /**
     * preRender hook
     */
    const preRenderData = preRender({
      context: { ...context },
      plugins
    })

    /**
     * render
     */
    const renderedView = renderToString(
      <Hypr store={createStore(context.state)} router={matcher([])} location={context.pathname}>
        <View {...context} {...preRenderData} />
      </Hypr>
    )

    /**
     * postRender hook
     */
    const postRenderData = postRender({
      context: { ...context },
      plugins: plugins
    })

    /**
     * create tags with new context
     */
    const tags = createDocument({
      context: { ...context },
      plugins,
      ...preRenderData,
      ...postRenderData
    })

    return doc({ ...tags, context, view: renderedView })
  }
}
