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

const isElement = node => node && isReactElement(node) && !isReactFragment(node)

const isReturned = (p) => {
  const { parent } = p

  if (
    t.isCallExpression(parent) ||
    t.isConditionalExpression(parent) ||
    t.isSequenceExpression(parent) ||
    t.isLogicalExpression(parent)
  ) {
    return isReturned(p.parentPath)
  }

  return t.isReturnStatement(parent) || t.isArrowFunctionExpression(parent)
}

const projectPath = process.cwd()

const getNode = (p) => {
  const { parent } = p

  if (isReactFragment(parent)) {
    return getNode(p.parentPath)
  }

  if (!isReturned(p)) return null

  let isComponent = false
  let componentNode = null
  let currentPath = p

  let node
  let parentPath

  do {
    ({ node, parentPath } = currentPath)

    if (parentPath && isElement(parentPath.node)) break

    isComponent = isComponent || (
      t.isArrowFunctionExpression(node)
      || t.isFunctionExpression(node)
      || t.isClassMethod(node)
      || t.isObjectMethod(node)
      || t.isFunctionDeclaration(node)
    )

    if (!componentNode && isComponent) {
      componentNode = node
    }

    switch (currentPath.type) {
      case 'VariableDeclaration':
      case 'ClassDeclaration':
      case 'ExportDefaultDeclaration':
      case 'ExportNamedDeclaration':
      case 'FunctionDeclaration': {
        if (!componentNode) break

        return { rootPath: currentPath, componentNode }
      }
    }

    currentPath = parentPath
  } while (currentPath)

  return null
}

const getName = ({ rootPath }) => {
  if (
    rootPath.type === 'ExportDefaultDeclaration' ||
    rootPath.parent.type === 'ExportDefaultDeclaration'
  ) return 'default'

  if (rootPath.type === 'VariableDeclaration') {
    const [declarator] = rootPath.node.declarations
    return declarator.id.name
  }

  return rootPath.node.id.name
}

const getId = (filename, name) =>
  hash(`${path.relative(projectPath, filename).toLowerCase()}:${name}`.split(path.sep).join('/')).toString(16)

const buildComment = hashmap => `__reselector__start__::${JSON.stringify(hashmap)}::__reselector__end__`
const getHashmapFromComment = (content) => {
  const [, result = ''] = content.match(/__reselector__start__::(.*?)::__reselector__end__/) || []
  if (result) return JSON.parse(result)
  return ''
}

module.exports = {
  getNode,
  getName,
  getId,
  isElement,
  isReactFragment,
  isReactElement,
  buildComment,
  getHashmapFromComment,
}
