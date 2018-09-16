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

const concat = (ID, CURR_ID) => (CURR_ID === "''"
  ? `"${ID}"`
  : `"${ID}" + (${CURR_ID} ? (' ' + ${CURR_ID}) : '')`)

const buildProps = template.expression(concat('ID', 'CURR_ID'))

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

        const propName = `${config.prefix}${TEST_ID}`

        let CURR_ID = "''"

        if (componentNode.type === 'ClassDeclaration') {
          CURR_ID = `this.props['${propName}']`
        } else {
          const curr = componentNode.init || componentNode.declaration || componentNode
          const [props] = curr.params

          if (!props) {
            curr.params.push(t.identifier('__props__'))
            CURR_ID = `__props__['${propName}']`
          } else if (props.type === 'Identifier') {
            CURR_ID = `${props.name}['${propName}']`
          } else {
            props.properties.push(t.objectProperty(
              t.identifier(`'${propName}'`),
              t.identifier('__dataprop__'),
            ))
            CURR_ID = '__dataprop__'
          }
        }

        const prop = config.env ? (
          t.jSXSpreadAttribute(
            t.identifier(`process.env.RESELECTOR === "true" ? {'${propName}': ${concat(
              id, CURR_ID,
            )}} : {}`),
          )
        ) : (
          t.JSXAttribute(t.JSXIdentifier(propName), t.JSXExpressionContainer(
            buildProps({
              CURR_ID: t.identifier(CURR_ID),
              ID: t.StringLiteral(id),
            }),
          ))
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
