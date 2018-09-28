'use strict'

const template = require('@babel/template').default
const t = require('@babel/types')

const config = require('./config')
const {
  getName,
  getId,
  getNode,
  isElement,
} = require('./utils')

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


const argsMap = new Map()
const componentsList = new Set()

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

module.exports = () => ({
  visitor: {
    CallExpression(p, { file }) {
      if (!isElement(p)) {
        return
      }

      const { rootPath, componentNode } = getNode(p) || {}

      if (!rootPath) return

      const { filename } = file.opts
      const name = getName({ rootPath, componentNode })
      const id = getId(filename, name)

      const propName = `${config.prefix}${TEST_ID}`

      const CURR_ID = addDataProp(componentNode, propName)

      const [, props] = p.node.arguments

      const prop = config.env ? (
        t.SpreadElement(t.identifier(`process.env.RESELECTOR === "true" ? {'${propName}': ${concat(
          id, CURR_ID,
        )}} : {}`))
      ) : (
        t.ObjectProperty(t.StringLiteral(propName), buildProps({
          CURR_ID: t.identifier(CURR_ID),
          ID: t.StringLiteral(id),
        }))
      )

      if (t.isObjectExpression(props)) {
        props.properties.push(prop)
      } else if (t.isNullLiteral(props)) {
        p.node.arguments[1] = t.isSpreadElement(prop)
          ? prop.argument
          : t.ObjectExpression([prop])
      } else if (t.isIdentifier(props)) {
        p.node.arguments[1] = t.ObjectExpression([
          t.SpreadElement(props),
          prop,
        ])
      }

      if (process.env.NODE_ENV !== 'test') {
        return
      }

      if (componentsList.has(componentNode)) {
        return
      }

      componentsList.add(componentNode)

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
