'use strict'

const { TEST_ID } = require('./const')

const select = (strings, ...values) => (
  strings
    .reduce((acc, val, i) =>
      acc.concat(
        val,
        values[i] ? `[data-${values[i][TEST_ID]}]` : '',
      ),
    '',
    )
    .replace(/\s+/g, ' ')
    .trim()
)

module.exports = select
