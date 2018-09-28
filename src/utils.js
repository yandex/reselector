'use strict'

const t = require('@babel/types')
const hash = require('string-hash')
const path = require('path')

const projectPath = process.cwd()

module.exports.getNode = (node) => {
  const { parent } = node

  switch (parent.type) {
    case 'ConditionalExpression':
    case 'LogicalExpression':
    case 'ReturnStatement':
    case 'ArrowFunctionExpression': {
      let currentPath = node
      const prevPaths = []

      do {
        prevPaths.push(currentPath)
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
              prevPaths.push(currentPath)
              currentPath = currentPath.parentPath
            }

            return { rootPath: currentPath, prevPaths, componentNode }
          }
        }
      } while (currentPath)
    }
  }

  return null
}

module.exports.getName = ({ rootPath, componentNode }) =>
  (rootPath.type === 'ExportDefaultDeclaration' || rootPath.parent.type === 'ExportDefaultDeclaration'
    ? 'default'
    : componentNode.id.name
  )

module.exports.getId = (filename, name) =>
  hash(`${path.relative(projectPath, filename)}:${name}`).toString(16)

/**
 * Basic React.Fragment check
 * We can improve it by checking import aliases if needs
 */
const isFragment = (element) => {
  if (t.isIdentifier(element) || t.isJSXIdentifier(element)) {
    return element.name === 'Fragment'
  }

  if (t.isMemberExpression(element) || t.isJSXMemberExpression(element)) {
    return element.object.name === 'React' && element.property.name === 'Fragment'
  }

  return false
}

const isReactElement = ({ object, property }) => (
  object.name === 'React' && property.name === 'createElement'
)

module.exports.isElement = (p) => {
  const { callee } = p.node
  const [element] = p.node.arguments

  return (
    element
    && t.isMemberExpression(callee)
    && isReactElement(callee)
    && !(isFragment(element))
  )
}

Object.assign(module.exports, {
  isFragment,
  isReactElement,
})
