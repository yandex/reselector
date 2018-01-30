'use strict'

const { TEST_ID } = require('./const')

const get = (strings, ...values) => strings.reduce(
  (acc, val, i) => acc.concat(
    val,
    values[i] ? `[data-${values[i][TEST_ID]}]` : '',
  ),
  '',
)

module.exports = get
