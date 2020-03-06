'use strict'

const { transformSync } = require('@babel/core')
const { readFileSync } = require('fs')
const { getNode, getName, isElement, getHashmapFromComment } = require('./utils')

const createResolve = (config) => {
  const NAME = config.name

  const getParser = () => {
    const exports = {}

    // TODO: reuse exports management with babel plugin
    const addExport = (p, { file }) => {
      const data = getNode(p)

      if (!data) return

      const { filename } = file.opts
      const [name, ...additionalNames] = getName(data)
      const id = config.getId(filename, name, require('./resolve'))

      exports[name] = { [NAME]: id }

      additionalNames.forEach((key) => {
        exports[key] = { [NAME]: id }
      })
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

  const resolve = (filename) => {
    if (!cache[filename]) {
      const content = readFileSync(filename).toString()
      const hashmap = getHashmapFromComment(content)

      if (hashmap) {
        cache[filename] = hashmap
      } else {
        const parser = getParser()

        transformSync(content, {
          babelrc: false,
          filename,
          plugins: [
            ...config.syntaxes,
            [parser.plugin],
          ],
        })

        cache[filename] = parser.exports
      }
    }

    return cache[filename]
  }

  const resolveBy = resolver => path => resolve(resolver(path))

  return { resolve, resolveBy }
}

const { resolve, resolveBy } = createResolve(require('./config'))

module.exports = resolve
module.exports.default = resolve
module.exports.resolveBy = resolveBy
module.exports.createResolve = createResolve
