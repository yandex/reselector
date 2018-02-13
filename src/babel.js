'use strict'

const template = require('babel-template')

const { TEST_ID } = require('./const')
const { getName, getId, getNode } = require('./utils')

const build = template(`
  COMPONENT.PROP = ID;
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

      if (name === 'default') {
        return
      }

      rootPath.insertAfter(
        build({
          COMPONENT: t.identifier(name),
          ID: t.StringLiteral(id),
          PROP: t.identifier(TEST_ID),
        }),
      )
    },
  },
})
