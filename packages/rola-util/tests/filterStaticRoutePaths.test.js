const fs = require('fs-extra')
const path = require('path')
const test = require('ava')

const outDir = path.join(process.cwd(), '/.cache')

const filterStaticRoutePaths = require('../filterStaticRoutePaths.js')

test.beforeEach(() => {
  fs.outputFileSync(
    path.join(outDir, 'foo.js'),
    `
    export function config () {
    }
    `
  )
  fs.outputFileSync(
    path.join(outDir, 'bar.js'),
    `
    export function load () {
    }
    `
  )
})

test('returns route with valid config() fn', t => {
  const routes = filterStaticRoutePaths(path.join(outDir, '*.js'))
  t.true(routes.length === 1)
  t.true(path.basename(routes[0]) === 'foo.js')
})

test('returns emptry array for single invalid route', t => {
  const routes = filterStaticRoutePaths(path.join(outDir, 'bar.js'))
  t.true(routes.length === 0)
})

test.after(() => {
  fs.removeSync(outDir)
})
