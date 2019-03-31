import React from 'react'
import { renderToString } from 'react-dom/server'
import createStore from 'picostate'
import matcher from './matcher.js'
import Rola from './Rola.js'

import plugins from '@/.rola/rola.plugins.js'

const doc = require('@rola/util/document.js')
const createDocument = require('@rola/util/createDocument.js')
const createServerRoot = require('@rola/util/createServerRoot.js')
const postServerRender = require('@rola/util/postServerRender.js')
const preServerRender = require('@rola/util/preServerRender.js')

export default function createStatic (view) {
  return function StaticComponent (context, serverProps) {
    context = {
      ...context,
      ...serverProps.context,
      state: {
        ...context.state,
        router: {
          location: context.pathname,
          params: {}
        }
      }
    }

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
      <Rola store={createStore(context.state)} router={matcher([])} location={context.pathname}>
        <View {...context} {...preRenderData} />
      </Rola>
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
      context: {
        ...context,
        ...serverProps.context
      },
      plugins,
      ...preRenderData,
      ...postRenderData,
      ...serverProps.tags // { head, body }
    }, true)

    return doc({ ...tags, context, view: renderedView })
  }
}
