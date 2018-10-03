'use strict'

const t = require('@babel/types')
const hash = require('string-hash')
const path = require('path')

/**
 * Basic React.Fragment check
 * We can improve it by checking import aliases if needs
 */
const isReactFragment = (node) => {
  if (!node) return false

  if (t.isJSXFragment(node)) {
    return true
  }

  const [element] = node.arguments || []

  if (t.isIdentifier(element)) {
    return element.name === 'Fragment'
  }

  if (t.isMemberExpression(element)) {
    return element.object.name === 'React' && element.property.name === 'Fragment'
  }

  return false
}

const isReactElement = (node) => {
  if (t.isJSXElement(node)) {
    return true
  }

  const { callee } = node

  if (!t.isMemberExpression(callee)) return false

  const { object, property } = callee

  return object.name === 'React' && property.name === 'createElement'
}

const isElement = node => isReactElement(node) && !isReactFragment(node)

const projectPath = process.cwd()

const getNode = (p) => {
  const { parent } = p

  if (isReactFragment(parent)) {
    return getNode(p.parentPath)
  }

  let isComponent = false

  if (![
    t.isConditionalExpression,
    t.isLogicalExpression,
    t.isReturnStatement,
    t.isArrowFunctionExpression,
  ].some(f => f(parent))) {
    return null
  }

  let currentPath = p
  const prevPaths = []

  do {
    isComponent = isComponent || (
      t.isArrowFunctionExpression(currentPath.node)
      || t.isFunctionExpression(currentPath.node)
      || t.isClassExpression(currentPath.node)
    )

    prevPaths.push(currentPath)
    currentPath = currentPath.parentPath

    if (!currentPath) {
      break
    }

    let componentNode = currentPath.node

    switch (currentPath.type) {
      case 'VariableDeclaration': {
        [componentNode] = currentPath.node.declarations

        if (!isComponent) {
          break
        }
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

  return null
}

const getName = ({ rootPath, componentNode }) =>
  (rootPath.type === 'ExportDefaultDeclaration' ||
  rootPath.parent.type === 'ExportDefaultDeclaration'
    ? 'default'
    : componentNode.id.name)

const getId = (filename, name) =>
  hash(`${path.relative(projectPath, filename)}:${name}`).toString(16)

module.exports = {
  getNode,
  getName,
  getId,
  isElement,
  isReactFragment,
  isReactElement,
}
