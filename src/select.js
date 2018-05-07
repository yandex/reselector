'use strict'

const { TEST_ID } = require('./const')
const config = require('./config')

const selectors = {
  css: value => `[${config.prefix}${value}]`,
  xpath: value => `[@${config.prefix}${value}]`,
}

const build = selector => (strings, ...values) => (
  strings
    .reduce((acc, string, i) => {
      const value = values[i]

      if (value === undefined) return acc.concat(string)

      return acc.concat(
        string,
        value && value[TEST_ID] ? selector(value[TEST_ID]) : value,
      )
    }, '')
    .replace(/\s+/g, ' ')
    .trim()
)

const select = build(selectors.css)

select.css = build(selectors.css)
select.xpath = build(selectors.xpath)

module.exports = select
