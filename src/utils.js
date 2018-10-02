'use strict'

const t = require('@babel/types')
const hash = require('string-hash')
const path = require('path')

/**
 * Basic React.Fragment check
 * We can improve it by checking import aliases if needs
 */
const isFragment = (element) => {
  if (t.isIdentifier(element)) {
    return element.name === 'Fragment'
  }

  if (t.isMemberExpression(element)) {
    return element.object.name === 'React' && element.property.name === 'Fragment'
  }

  return false
}

const isReactElement = (node) => {
  if (!t.isMemberExpression(node)) return false

  const { object, property } = node

  return object.name === 'React' && property.name === 'createElement'
}

const isElement = (node) => {
  if (t.isJSXElement(node)) {
    return !t.isJSXFragment(node)
  }

  const { callee } = node
  const [element] = node.arguments || []

  return element && isReactElement(callee) && !isFragment(element)
}

const projectPath = process.cwd()

module.exports.getNode = (p) => {
  const { parent } = p

  switch (parent.type) {
    case 'ConditionalExpression':
    case 'LogicalExpression':
    case 'ReturnStatement':
    case 'ArrowFunctionExpression': {
      let currentPath = p
      const prevPaths = []

      do {
        prevPaths.push(currentPath)
        currentPath = currentPath.parentPath

        if (!currentPath) {
          break
        }

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

        if (isElement(componentNode)) {
          break
        }
      } while (currentPath)
    }
  }

  return null
}

module.exports.getName = ({ rootPath, componentNode }) =>
  (rootPath.type === 'ExportDefaultDeclaration' ||
  rootPath.parent.type === 'ExportDefaultDeclaration'
    ? 'default'
    : componentNode.id.name)

module.exports.getId = (filename, name) =>
  hash(`${path.relative(projectPath, filename)}:${name}`).toString(16)

Object.assign(module.exports, {
  isFragment,
  isElement,
  isReactElement,
})
