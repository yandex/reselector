'use strict'

const { TEST_ID } = require('./const')
const config = require('./config')

const selectors = {
  css: value => (value ? `[${config.prefix}${value[TEST_ID]}]` : ''),
  xpath: value => (value ? `[@${config.prefix}${value[TEST_ID]}]` : ''),
}

const build = selector => (strings, ...values) => (
  strings
    .reduce((acc, val, i) => acc.concat(val, selector(values[i])), '')
    .replace(/\s+/g, ' ')
    .trim()
)

const select = build(selectors.css)

select.css = build(selectors.css)
select.xpath = build(selectors.xpath)

module.exports = select
