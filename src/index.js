'use strict'

const shortid = require('shortid')
const template = require('babel-template')

const { TEST_ID } = require('./const')

const build = template(`
  COMPONENT.NAME = ID;
`)

module.exports = ({ types: t }) => {
  let hash

  return {
    pre() {
      hash = 0
    },
    visitor: {
      JSXElement(p) {
        const { node, parent } = p

        switch (parent.type) {
          case 'ReturnStatement':
          case 'ArrowFunctionExpression': {
            const { openingElement } = node
            const { name } = openingElement.name

            if (!name) return

            const id = process.env.NODE_ENV === 'production'
              ? shortid.generate()
              : `test-${String(hash++)}`

            openingElement.attributes.push(
              t.JSXAttribute(t.JSXIdentifier(`data-${id}`)),
            )

            let path = p.parentPath

            while (path) {
              path = path.parentPath

              let componentNode = path.node

              switch (path.type) {
                case 'VariableDeclaration': {
                  [componentNode] = path.node.declarations
                }
                // falls through
                case 'ClassDeclaration':
                case 'FunctionDeclaration': {
                  if (path.parent.type === 'ExportNamedDeclaration') {
                    path = path.parentPath
                  }

                  path.insertAfter(
                    build({
                      COMPONENT: t.identifier(componentNode.id.name),
                      ID: t.StringLiteral(id),
                      NAME: t.identifier(TEST_ID),
                    }),
                  )

                  return
                }
              }
            }
          }
        }
      },
    },
  }
}

module.exports.get = require('./get')
