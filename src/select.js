'use strict'

const config = require('./config')

const NAME = config.name

const selectors = {
  css: value => `[${NAME}~="${value}"]`,
  xpath: value => `[contains(@${NAME}, '${value}')]`,
}

const build = selector => (strings, ...values) => (
  strings
    .reduce((acc, string, i) => {
      const value = values[i]

      if (value === undefined) {
        if (i < strings.length - 1) {
          throw new Error("reselector: you can't use undefined value in select")
        }

        return acc.concat(string)
      }

      if (value && value[NAME]) {
        return acc.concat(
          string,
          selector(value[NAME]),
        )
      }

      if (typeof value === 'object' || typeof value === 'function') {
        throw new Error('reselector: you can use only primitive values')
      }

      return acc.concat(
        string,
        value,
      )
    }, '')
    .replace(/\s+/g, ' ')
    .trim()
)

const select = build(selectors.css)

select.css = build(selectors.css)
select.xpath = build(selectors.xpath)

module.exports = select
