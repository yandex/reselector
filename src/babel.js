'use strict'

const template = require('babel-template')

const { TEST_ID } = require('./const')
const { getName, getId, getNode } = require('./utils')

const build = template(`
  COMPONENT.NAME = ID;
`)

module.exports = ({ types: t }) => ({
  visitor: {
    JSXElement(p, { file }) {
      const { openingElement, rootPath, componentNode } = getNode(t, p) || {}

      if (!openingElement) return

      const { filename } = file.opts
      const name = getName({ rootPath, componentNode })
      const id = getId(filename, name)

      openingElement.attributes.push(
        t.JSXAttribute(t.JSXIdentifier(`data-${id}`)),
      )

      rootPath.insertAfter(
        build({
          COMPONENT: t.identifier(name === 'default' ? `exports.${name}` : name),
          ID: t.StringLiteral(id),
          NAME: t.identifier(TEST_ID),
        }),
      )
    },
  },
})
