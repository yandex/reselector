'use strict'

module.exports = {
  extends: '@lttb/default',

  rules: {
    'no-fallthrough': ['error', {commentPattern: 'falls through'}],
    strict: ['error', 'safe'],
    'react/jsx-filename-extension': 'off',
    'no-plusplus': 'off',
    'default-case': 'off',
  },

  parserOptions: {
    sourceType: 'script',
  },

  overrides: [
    {
      files: ['*.config.js', '.*.js'],
      rules: {
        'flowtype/require-valid-file-annotation': 'off',
        'global-require': 'off',
        'comma-dangle': [
          'error',
          {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'ignore',
          },
        ],
      },
    },
    {
      files: ['**/tests/**/*.js', '**/configs/**/*.js',],
      rules: {
        'react/prop-types': 'off',
        'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
      },
      env: {
        jest: true,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
}
