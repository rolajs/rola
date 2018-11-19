import metaTags from 'html-meta-tags'

const { NODE_ENV } = process.env

export function log (...args) {
  console.log(
    ...args
  )
}

export function getHead ({ meta, state, config }) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>${meta.title}</title>
      ${metaTags(meta)}
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      ${NODE_ENV === 'production' ? `<link rel='stylesheet' href='/main.css?v=${config.version}' />` : ''}
    </head>
    <body>
      <div id='root'>`
}
