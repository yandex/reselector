'use strict'

const path = require('path')
const hash = require('string-hash')

const projectPath = process.cwd()

module.exports.getNode = (t, p) => {
  const { node, parent } = p

  switch (parent.type) {
    case 'ReturnStatement':
    case 'ArrowFunctionExpression': {
      const { openingElement } = node
      const { name } = openingElement.name

      if (!name) return null

      let currentPath = p

      do {
        currentPath = currentPath.parentPath

        if (!currentPath) return null

        let componentNode = currentPath.node

        switch (currentPath.type) {
          case 'VariableDeclaration': {
            [componentNode] = currentPath.node.declarations
          }
          // falls through
          case 'ClassDeclaration':
          case 'ExportDefaultDeclaration':
          case 'ExportNamedDeclaration':
          case 'FunctionDeclaration': {
            if (currentPath.parent.type === 'ExportNamedDeclaration') {
              currentPath = currentPath.parentPath
            }

            return { rootPath: currentPath, componentNode, openingElement }
          }
        }
      } while (currentPath)
    }
  }

  return null
}

module.exports.getName = ({ rootPath, componentNode }) =>
  (rootPath.type === 'ExportDefaultDeclaration'
    ? 'default'
    : componentNode.id.name
  )

module.exports.getId = (filename, name) =>
  hash(`${path.relative(projectPath, filename)}:${name}`).toString(16)
