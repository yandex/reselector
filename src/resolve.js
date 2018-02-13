'use strict'

const { transformFileSync } = require('babel-core')
const { getNode, getId, getName } = require('./utils')

const { TEST_ID } = require('./const')

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
      plugins: [
        'syntax-jsx',
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
