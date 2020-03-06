'use strict'

const template = require('@babel/template').default
const t = require('@babel/types')

const config = require('./config')
const {
  getName,
  getNode,
  isElement,
  buildComment,
} = require('./utils')

const { getId } = config

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
  concat: template.expression("'ID' + (COND ? (' ' + CURR_ID) : '')"),
}

const buildProps = (id, { ARG, CURR_ID }) => {
  if (!CURR_ID) {
    return expressions.id({ ID: t.StringLiteral(id) })
  }

  const currId = t.identifier(CURR_ID)

  const COND = ARG
    ? t.logicalExpression('&&', t.identifier(ARG), currId)
    : currId

  return expressions.concat({
    ID: t.StringLiteral(id),
    COND,
    CURR_ID: currId,
  })
}

const buildEnv = template.expression(
  'process.env.RESELECTOR === "true" ? {"NAME": VALUE} : {}',
  { placeholderPattern: false, placeholderWhitelist: new Set(['NAME', 'VALUE']) },
)

const buildEnvWithProp = template.expression(
  'process.env.RESELECTOR === "true" ? {"NAME": VALUE, "PROP_NAME": PROP_VALUE} : {}',
  { placeholderPattern: false, placeholderWhitelist: new Set(['NAME', 'VALUE', 'PROP_NAME', 'PROP_VALUE']) },
)

const NAME = config.name
const PROP_NAME = `${NAME}-prop`

const PROPS_ARG = '__props__'
const DATAPROP_ARG = '__dataprop__'

const createAddDataProp = () => {
  const argsMap = new Map()

  return (componentNode) => {
    if (argsMap.has(componentNode)) {
      return argsMap.get(componentNode)
    }

    let ARG = ''
    let CURR_ID = ''

    if (t.isClassMethod(componentNode)) {
      ARG = 'this.props'
      CURR_ID = `${ARG}['${PROP_NAME}']`
    } else {
      const curr = componentNode.init || componentNode.declaration || componentNode

      if (!curr.params) {
        argsMap.set(componentNode, { CURR_ID })
        return argsMap.get(componentNode)
      }

      const [props] = curr.params

      if (!props) {
        /**
         * If there are no arguments, add one
         */

        curr.params.push(t.identifier(PROPS_ARG))
        ARG = PROPS_ARG
        CURR_ID = `${ARG}['${PROP_NAME}']`
      } else if (t.isIdentifier(props)) {
        /**
         * Get the first argument name
         */

        ARG = props.name
        CURR_ID = `${ARG}['${PROP_NAME}']`
      } else if (t.isObjectPattern(props)) {
        /**
         * Add property
         */

        const restProps = props.properties.find(p => t.isRestElement(p))

        if (restProps) {
          ARG = restProps.argument.name
          CURR_ID = `${ARG}['${PROP_NAME}']`
        } else {
          props.properties.push(t.objectProperty(
            t.identifier(`'${PROP_NAME}'`),
            t.identifier(DATAPROP_ARG),
          ))
          CURR_ID = DATAPROP_ARG
        }
      }
    }

    argsMap.set(componentNode, { ARG, CURR_ID })

    return argsMap.get(componentNode)
  }
}

const isExtended = props => (
  t.isCallExpression(props) && (props.callee.name === '_extends' || props.callee.name === '_objectSpread')
)

module.exports = () => {
  const addDataProp = createAddDataProp()

  let componentsList
  let pathsList
  let hashmap

  let proceed = false

  return ({
    pre(state) {
      componentsList = new Set()
      pathsList = new Set()
      hashmap = {}
      /** don't apply reselector for files that were already proceed */
      proceed = (state.ast.comments || []).some(x => x.value.includes('__reselector__start__::'))
    },
    post(state) {
      if (Object.keys(hashmap).length > 0) {
        state.path.addComment('leading', buildComment(hashmap))
      }
    },
    visitor: {
      CallExpression(p, { file, opts }) {
        if (proceed) return

        if (!isElement(p.node)) {
          return
        }

        const { rootPath, componentNode } = getNode(p) || {}

        if (!(rootPath && componentNode)) return

        if (pathsList.has(p)) {
          return
        }

        pathsList.add(p)

        const { filename } = file.opts
        const [name, ...additionalNames] = getName({ rootPath, componentNode })
        const id = getId(filename, name, require('./resolve'))

        if (opts.setHash) {
          opts.setHash({ id, name, filename, loc: componentNode.loc })
        }

        hashmap[name] = { [NAME]: id }

        additionalNames.forEach((key) => {
          hashmap[key] = { [NAME]: id }
        })

        const [elementName, props] = p.node.arguments

        const isTag = t.isStringLiteral(elementName)

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

        const VALUE = buildProps(id, addDataProp(componentNode))
        const PROP_VALUE = VALUE

        let dataProps

        if (isTag) {
          dataProps = (config.env && config.envName === 'test') ? [
            t.SpreadElement(buildEnv({
              NAME,
              VALUE,
            }),
            )] : [
            t.ObjectProperty(t.StringLiteral(NAME), VALUE),
          ]
        } else {
          dataProps = (config.env && config.envName === 'test') ? [
            t.SpreadElement(buildEnvWithProp({
              NAME,
              VALUE,
              PROP_NAME,
              PROP_VALUE,
            }),
            )] : [
            t.ObjectProperty(t.StringLiteral(NAME), VALUE),
            t.ObjectProperty(t.StringLiteral(PROP_NAME), PROP_VALUE),
          ]
        }

        if (t.isObjectExpression(props)) {
          props.properties.push(...dataProps)
        } else {
          const arg = t.isSpreadElement(dataProps[0])
            /**
             * Spread element value
             */
            ? dataProps[0].argument
            : t.ObjectExpression(dataProps)

          if (isExtended(props)) {
            props.arguments.push(arg)
          } else if (t.isNullLiteral(props)) {
            p.node.arguments[1] = arg
          } else {
            p.node.arguments[1] = spread([t.ObjectExpression([]), props, arg])
          }
        }

        if (config.envName !== 'test') {
          return
        }

        if (componentsList.has(componentNode)) {
          return
        }

        componentsList.add(componentNode)

        if (t.isObjectMethod(componentNode)) {
          return
        }

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
}
