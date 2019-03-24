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

function clone (obj) {
  return Object.assign({}, obj)
}

export default function createStatic (view) {
  return function StaticComponent (context) {
    const View = createRoot({
      root: view,
      context: clone(context),
      plugins
    })

    /**
     * preRender hook
     */
    const preRenderData = preRender({
      context: clone(context),
      plugins
    })

    context = Object.assign(clone(context), preRenderData)

    /**
     * render
     */
    const renderedView = renderToString(
      <Hypr store={createStore(context.state)} router={matcher([])} location={context.pathname}>
        <View {...context} />
      </Hypr>
    )

    /**
     * postRender hook
     */
    const postRenderData = postRender({
      context: clone(context),
      plugins: plugins
    })

    context = Object.assign(clone(context), postRenderData)

    console.log(JSON.stringify(context))

    /**
     * create tags with new context
     */
    const tags = createDocument({
      context: clone(context),
      plugins: plugins
    })

    return doc({ ...tags, context, view: renderedView })
  }
}
