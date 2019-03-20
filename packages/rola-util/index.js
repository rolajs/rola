const getConfig = require('./getConfig.js')
const document = require('./document.js')

/**
 * plugin API utils
 */
const createDocument = require('./createDocument.js')
const postRender = require('./postRender.js')
const preRender = require('./preRender.js')

module.exports = {
  getConfig,
  document,
  createDocument,
  postRender,
  preRender,
}
