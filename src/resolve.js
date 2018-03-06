'use strict'

const { transformFileSync } = require('@babel/core')
const cosmiconfig = require('cosmiconfig')
const { getNode, getId, getName } = require('./utils')

const { TEST_ID } = require('./const')

const config = Object.assign({
  syntaxes: [
    '@babel/plugin-syntax-async-generators',
    '@babel/plugin-syntax-class-properties',
    '@babel/plugin-syntax-decorators',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-export-default-from',
    '@babel/plugin-syntax-export-namespace-from',
    '@babel/plugin-syntax-flow',
    '@babel/plugin-syntax-function-bind',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-syntax-nullish-coalescing-operator',
    '@babel/plugin-syntax-numeric-separator',
    '@babel/plugin-syntax-object-rest-spread',
    '@babel/plugin-syntax-optional-catch-binding',
    '@babel/plugin-syntax-optional-chaining',
    '@babel/plugin-syntax-pipeline-operator',
    '@babel/plugin-syntax-throw-expressions',
  ],
}, cosmiconfig('reselector', { sync: true }))

const getParser = () => {
  const exports = {}

  return {
    exports,
    plugin: ({ types: t }) => ({
      visitor: {
        JSXElement(p, { file }) {
          const data = getNode(t, p)

          if (!data) return

          const { filename } = file.opts
          const name = getName(data)
          const id = getId(filename, name)

          exports[name] = { [TEST_ID]: id }
        },
      },
    }),
  }
}

const cache = {}

const resolve = (path) => {
  if (!cache[path]) {
    const parser = getParser()

    transformFileSync(path, {
      babelrc: false,
      plugins: [
        ...config.syntaxes,
        [parser.plugin],
      ],
    })

    cache[path] = parser.exports
  }

  return cache[path]
}

const resolveBy = resolver => path => resolve(resolver(path))

module.exports = resolve
module.exports.default = resolve
module.exports.resolveBy = resolveBy
