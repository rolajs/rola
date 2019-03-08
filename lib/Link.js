import React from 'react'
import cx from 'nanoclass'
import { history } from './history.js'

export default function Link (props) {
  const {
    children,
    href,
    className,
    target,
    download,
    ...rest
  } = props

  const cn = cx([
    className,
    (history.location === href) && 'active'
  ])

  const opts = {}

  if (target) opts.target = target
  if (download) opts.download = download

  return (
    <a href={href} className={cn} onClick={e => {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.shiftKey ||
        e.defaultPrevented ||
        opts.target === '_blank' ||
        opts.download ||
        /mailto|tel/.test(href) ||
        /^(https?:)?\/\//.test(href)
      ) return

      e.preventDefault()

      history.pushState(href)
    }} {...opts} {...rest}>{children}</a>
  )
}
