/**
 * internal utils
 */
const getModule = require('./getModule.js')

/**
 * the default document creator
 */
const document = require('./document.js')

/**
 * plugin API utils
 */
const createDocument = require('./createDocument.js')
const createRoot = require('./createRoot.js')
const postRender = require('./postRender.js')
const preRender = require('./preRender.js')

module.exports = {
  getModule,

  document,

  createDocument,
  createRoot,
  postRender,
  preRender,
}
