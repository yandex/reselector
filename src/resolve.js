'use strict'

const { transformFileSync } = require('@babel/core')
const { getNode, getId, getName, isElement } = require('./utils')

const config = require('./config')

const NAME = config.name

const getParser = () => {
  const exports = {}

  const addExport = (p, { file }) => {
    const data = getNode(p)

    if (!data) return

    const { filename } = file.opts
    const name = getName(data)
    const id = getId(filename, name)

    exports[name] = { [NAME]: id }
  }

  return {
    exports,
    plugin: () => ({
      visitor: {
        JSXElement(p, state) {
          if (!isElement(p.node)) {
            return
          }

          addExport(p, state)
        },
        CallExpression(p, state) {
          if (!isElement(p.node)) {
            return
          }

          addExport(p, state)
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
