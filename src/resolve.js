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
    if (!config.usageNodeModulesPackages) {
      const parser = getParser()

      transformFileSync(path, {
        babelrc: false,
        plugins: [
          ...config.syntaxes,
          [parser.plugin],
        ],
      })

      cache[path] = parser.exports
    } else {
      const file = transformFileSync(path, {
        babelrc: false,
        plugins: config.syntaxes,
      })
      const matches = file.code.match(/reselector-map__starts:(.*?)reselector-map__ends/gi) || []
      matches.forEach((match) => {
        const body = match.match(/reselector-map__starts:(.*?)reselector-map__ends/)[1]
        cache[path] = Object.assign(cache[path] || {}, JSON.parse(body))
      })
    }
  }
  return cache[path]
}

const resolveBy = resolver => path => resolve(resolver(path))

module.exports = resolve
module.exports.default = resolve
module.exports.resolveBy = resolveBy
