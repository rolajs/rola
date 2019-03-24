import React from 'react'
import { renderToString } from 'react-dom/server'
import createStore from 'picostate'
import matcher from './matcher.js'
import Hypr from './Hypr.js'

import plugins from '@/rola.plugins.js'

const doc = require('@rola/util/document.js')
const createDocument = require('@rola/util/createDocument.js')
const createServerRoot = require('@rola/util/createServerRoot.js')
const postServerRender = require('@rola/util/postServerRender.js')
const preServerRender = require('@rola/util/preServerRender.js')

export default function createStatic (view) {
  return function StaticComponent (context) {
    const View = createServerRoot({
      root: view,
      context: { ...context },
      plugins
    })

    /**
     * preServerRender hook
     */
    const preRenderData = preServerRender({
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
     * postServerRender hook
     */
    const postRenderData = postServerRender({
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
