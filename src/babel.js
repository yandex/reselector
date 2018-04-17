'use strict'

const template = require('@babel/template').default

const config = require('./config')
const { TEST_ID } = require('./const')
const { getName, getId, getNode } = require('./utils')

const build = template(`
  COMPONENT.PROP = ID
`)

const buildDefaultExport = template(`
    if (module.exports) {
      module.exports.default.PROP = ID
    }
`)

module.exports = ({ types: t }) => {
  /**
   * Basic React.Fragment check
   * We can improve it by checking import aliases if needs
   */
  const isFragment = ({ name }) => {
    if (t.isJSXIdentifier(name)) {
      return name.name === 'Fragment'
    }

    if (t.isJSXMemberExpression(name)) {
      return name.name === 'React' && name.property.name === 'Fragment'
    }

    return false
  }

  return ({
    visitor: {
      JSXElement(p, { file }) {
        const { openingElement, rootPath, componentNode } = getNode(t, p) || {}

        if (!openingElement || isFragment(openingElement)) return

        const { filename } = file.opts
        const name = getName({ rootPath, componentNode })
        const id = getId(filename, name)

        const propName = `${config.prefix}${id}`

        const prop = config.env ? (
          t.jSXSpreadAttribute(
            t.identifier(`process.env.RESELECTOR === "true" ? {'${propName}': true} : {}`),
          )
        ) : (
          t.JSXAttribute(t.JSXIdentifier(propName))
        )

        openingElement.attributes.push(prop)

        if (process.env.NODE_ENV !== 'test') {
          return
        }

        rootPath.insertAfter(
          name === 'default'
            ? buildDefaultExport({
              ID: t.StringLiteral(id),
              PROP: t.identifier(TEST_ID),
            })
            : build({
              COMPONENT: t.identifier(name),
              ID: t.StringLiteral(id),
              PROP: t.identifier(TEST_ID),
            }),
        )
      },
    },
  })
}
