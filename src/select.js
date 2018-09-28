'use strict'

const config = require('./config')

const NAME = config.name

const selectors = {
  css: value => `[${NAME}~="${value}"]`,
  xpath: value => `[@${NAME}~="${value}"]`,
}

const build = selector => (strings, ...values) => (
  strings
    .reduce((acc, string, i) => {
      const value = values[i]

      if (value === undefined) return acc.concat(string)

      return acc.concat(
        string,
        value && value[NAME] ? selector(value[NAME]) : value,
      )
    }, '')
    .replace(/\s+/g, ' ')
    .trim()
)

const select = build(selectors.css)

select.css = build(selectors.css)
select.xpath = build(selectors.xpath)

module.exports = select
