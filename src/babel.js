'use strict'

const template = require('@babel/template').default
const hash = require('string-hash')

const config = require('./config')
const { getName, getId, getNode } = require('./utils')

const attributeMap = new Set()

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

const TEST_ID = config.name

const PROPS_ARG = '__props__'
const DATAPROP_ARG = '__dataprop__'

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

  const argsMap = new Map()

  const addDataProp = (componentNode, propName) => {
    if (argsMap.has(componentNode)) {
      return argsMap.get(componentNode)
    }

    let CURR_ID = "''"

    if (componentNode.type === 'ClassDeclaration') {
      CURR_ID = `this.props['${propName}']`
    } else {
      const curr = componentNode.init || componentNode.declaration || componentNode
      const [props] = curr.params

      if (!props) {
        curr.params.push(t.identifier(PROPS_ARG))
        CURR_ID = `${PROPS_ARG}['${propName}']`
      } else if (props.type === 'Identifier') {
        CURR_ID = `${props.name}['${propName}']`
      } else {
        props.properties.push(t.objectProperty(
          t.identifier(`'${propName}'`),
          t.identifier(DATAPROP_ARG),
        ))
        CURR_ID = DATAPROP_ARG
      }
    }

    argsMap.set(componentNode, CURR_ID)

    return CURR_ID
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

        const CURR_ID = addDataProp(componentNode, propName)

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

        const propMeta = !prop ? 'null' : hash(JSON.stringify(prop))
        const hashId = hash(`${filename}_${name}_${propMeta}`).toString(16)

        if (process.env.NODE_ENV !== 'test') {
          return
        }

        if (attributeMap.has(hashId)) {
          return
        }

        attributeMap.add(hashId)

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
