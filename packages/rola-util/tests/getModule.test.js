const fs = require('fs-extra')
const path = require('path')
const test = require('ava')

const cwd = process.cwd()

const outDir = path.join(cwd, '/.cache')

const getModule = require('../getModule.js')

test.beforeEach(() => {
  fs.outputFileSync(
    path.join(outDir, 'es6.js'),
    `
    import React from 'react'
    export const foo = 'foo export'
    export function component (props) {
      return <div />
    }
    `
  )
})

test('transpiles es6', t => {
  const mod = getModule(
    path.join(outDir, 'es6.js'),
    path.join(outDir, 'sub')
  )

  t.true(mod.foo === 'foo export')
  t.true(typeof mod.component === 'function')
})

test('works without outDir arg', t => {
  const mod = getModule(
    path.join(outDir, 'es6.js')
  )

  t.true(mod.foo === 'foo export')
  t.true(typeof mod.component === 'function')
})

test('file fails with relative path', t => {
  try {
    const mod = getModule('es6.js', outDir)
  } catch (e) {
    t.pass()
  }
})

test('outDir fails with relative path', t => {
  try {
    const mod = getModule(path.join(outDir, 'es6.js'), './')
  } catch (e) {
    t.pass()
  }
})

test('gets local aliases, if available', t => {
  fs.outputFileSync(
    path.join(outDir, 'alias.js'),
    `
    import self from '@'
    export default self
    `
  )
  fs.outputFileSync(
    path.join(cwd, 'rola.config.js'),
    `export const alias = {
      '@': '../rola.config.js'
    }`
  )

  try {
    const mod = getModule(path.join(outDir, 'alias.js'))
    t.pass()
  } catch (e) {
    t.fail(e)
  }
})

test.after(() => {
  fs.removeSync(outDir)
  fs.removeSync(path.join(cwd, 'rola.config.js'))
})
