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
  COMPONENT["PROP"] = ID
`)

const buildDefaultExport = template(`
    if (module.exports) {
      module.exports.default["PROP"] = ID
    }
`)

const expressions = {
  id: template.expression("'ID'"),
  concat: template.expression("'ID' + (CURR_ID ? (' ' + CURR_ID) : '')"),
}

const buildProps = (id, CURR_ID) => {
  if (CURR_ID === "''") {
    return expressions.id({ ID: t.StringLiteral(id) })
  }

  return expressions.concat({
    ID: t.StringLiteral(id),
    CURR_ID: t.identifier(CURR_ID),
  })
}

const buildEnv = template.expression(
  'process.env.RESELECTOR === "true" ? {"NAME": VALUE} : {}',
  { placeholderPattern: false, placeholderWhitelist: new Set(['NAME', 'VALUE']) },
)

const NAME = config.name

const PROPS_ARG = '__props__'
const DATAPROP_ARG = '__dataprop__'


const argsMap = new Map()
const componentsList = new Set()
const pathsList = new Set()

const addDataProp = (componentNode) => {
  if (argsMap.has(componentNode)) {
    return argsMap.get(componentNode)
  }

  let CURR_ID = "''"

  if (t.isClassDeclaration(componentNode)) {
    CURR_ID = `this.props['${NAME}']`
  } else {
    const curr = componentNode.init || componentNode.declaration || componentNode

    if (!curr.params) return CURR_ID

    const [props] = curr.params

    if (!props) {
      /**
       * If there are no arguments, add one
       */

      curr.params.push(t.identifier(PROPS_ARG))
      CURR_ID = `${PROPS_ARG}['${NAME}']`
    } else if (t.isIdentifier(props)) {
      /**
       * Get the first argument name
       */

      CURR_ID = `${props.name}['${NAME}']`
    } else if (t.isObjectPattern(props)) {
      /**
       * Add property
       */

      props.properties.push(t.objectProperty(
        t.identifier(`'${NAME}'`),
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
      if (!isElement(p.node)) {
        return
      }

      const { rootPath, componentNode } = getNode(p) || {}

      if (!rootPath) return

      if (pathsList.has(p)) {
        return
      }

      pathsList.add(p)

      const { filename } = file.opts
      const name = getName({ rootPath, componentNode })
      const id = getId(filename, name)

      const CURR_ID = addDataProp(componentNode)

      const [, props] = p.node.arguments

      let helper

      const spread = (objs) => {
        if (!helper) {
          /**
           * Helper from babel-helper-builder-react-jsx
           */
          helper = config.useBuiltIns
            ? t.memberExpression(t.identifier('Object'), t.identifier('assign'))
            : file.addHelper('extends')
        }

        return t.callExpression(helper, [].concat(objs))
      }

      const prop = (config.env && process.env.NODE_ENV === 'test') ? (
        t.SpreadElement(buildEnv({
          NAME,
          VALUE: buildProps(id, CURR_ID),
        }),
        )) : (
        t.ObjectProperty(t.StringLiteral(NAME), buildProps(id, CURR_ID))
      )

      if (t.isObjectExpression(props)) {
        props.properties.push(prop)
      } else {
        const arg = t.isObjectProperty(prop)
          ? t.ObjectExpression([prop])
          /**
           * Spread element value
           */
          : prop.argument

        if (t.isNullLiteral(props)) {
          p.node.arguments[1] = arg
        } else if (t.isIdentifier(props)) {
          p.node.arguments[1] = spread([t.ObjectExpression([]), props, arg])
        }
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
            PROP: t.StringLiteral(NAME),
          })
          : build({
            COMPONENT: t.identifier(name),
            ID: t.StringLiteral(id),
            PROP: t.StringLiteral(NAME),
          }),
      )
    },
  },
})
