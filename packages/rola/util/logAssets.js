module.exports = function logAssets ({ duration, assets }, opts = {}) {
  log.info('built', `in ${duration}ms\n${assets.reduce((_, asset, i) => {
    const size = opts.gzip && asset.size.gzip ? asset.size.gzip + 'kb gzipped' : asset.size.raw + 'kb'
    return _ += `  > ${log.colors.gray(asset.filename)} ${size}${i !== assets.length - 1 ? `\n` : ''}`
  }, '')}`, opts.persist)
}
