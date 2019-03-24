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
const createClientRoot = require('./createClientRoot.js')
const createServerRoot = require('./createServerRoot.js')
const postServerRender = require('./postServerRender.js')
const preServerRender = require('./preServerRender.js')

module.exports = {
  getModule,

  document,

  createDocument,
  createClientRoot,
  createServerRoot,
  postServerRender,
  preServerRender,
}
