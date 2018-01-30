'use strict'

const { TEST_ID, TEST_ATTR } = require('./const')

const get = (strings, ...values) => strings.reduce(
  (acc, val, i) => acc.concat(
    val,
    values[i] ? `[${TEST_ATTR}="${values[i][TEST_ID]}"]` : '',
  ),
  '',
)

module.exports = get
