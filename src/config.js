'use strict'

const cosmiconfig = require('cosmiconfig')

const { config } = (cosmiconfig('reselector').searchSync() || {})

module.exports = Object.assign({
  env: false,
  envName: process.env.BABEL_ENV || process.env.NODE_ENV || 'development',
  name: 'data-tid',
  propName: 'data-tid-prop',
  syntaxes: [
    '@babel/plugin-syntax-async-generators',
    '@babel/plugin-syntax-class-properties',
    /**
     * @see https://github.com/babel/babel/issues/7786
     */
    ['@babel/plugin-syntax-decorators', { legacy: true }],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-export-default-from',
    '@babel/plugin-syntax-export-namespace-from',
    '@babel/plugin-syntax-flow',
    '@babel/plugin-syntax-function-bind',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-syntax-nullish-coalescing-operator',
    '@babel/plugin-syntax-numeric-separator',
    '@babel/plugin-syntax-object-rest-spread',
    '@babel/plugin-syntax-optional-catch-binding',
    '@babel/plugin-syntax-optional-chaining',
    ['@babel/plugin-syntax-pipeline-operator', { proposal: 'minimal' }],
    '@babel/plugin-syntax-throw-expressions',
  ],
}, config)
