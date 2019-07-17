'use strict'

module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
      targets: {
        node: '10',
      },
    }],
  ],
  overrides: [{
    test: '**/tests/**',
    plugins: [
      './src/babel',
    ],
    presets: [
      ['@babel/preset-react', { useBuiltIns: true }],
    ],
  }],
}
