# reselector

[![Travis branch](https://img.shields.io/travis/lttb/reselector/master.svg?style=flat)](https://travis-ci.org/lttb/reselector)
[![Coverage Status branch](https://img.shields.io/coveralls/lttb/reselector/master.svg?style=flat)](https://img.shields.io/coveralls/lttb/reselector/master.svg?branch=master)
[![npm version](https://img.shields.io/npm/v/reselector.svg?style=flat)](https://www.npmjs.com/package/reselector)
[![npm license](https://img.shields.io/npm/l/reselector.svg?style=flat)](https://www.npmjs.com/package/reselector) [![Greenkeeper badge](https://badges.greenkeeper.io/lttb/reselector.svg)](https://greenkeeper.io/)

## Installation

```sh
npm install --save-dev reselector
```

## Usage

You can use it as a babel-plugin or as the runtime function, or both.

### babel-plugin

Add `reselector` to the plugin list in `.babelrc` for your client code. For example:

```js
{
    presets: ['react'],
    env: {
        test: {
            plugins: [
                'reselector/babel',
            ],
        },
    },
}
```

### Find Components in the DOM

Use `select` function to build any css selector by React Components.

Just a simple example with [jest](https://facebook.github.io/jest/)

```jsx
import React from 'react'
import {render} from 'react-dom'
import {select} from 'reselector'

const Text = ({children}) => <p>{children}</p>

const Button = ({children}) => (
  <button>
    <Text>{children}</Text>
  </button>
)

describe('Button', () => {
  beforeEach(() => document.body.innerHTML = '<div id="app" />')

  it('should render a text', () => {
    const text = 'hello world!'
    render(<Button>{text}</Button>, window.app)

    const node = document.querySelector(select`${Button} > ${Text}`)
    expect(node.textContent).toBe(text)
  })
})
```

### enzyme

It also works with libraries like [enzyme](https://github.com/airbnb/enzyme) out of the box.

```jsx
import {render} from 'enzyme'

import Button from './Button'
import Text from './Text'

describe('Button', () => {
  it('should render a text', () => {
    const text = 'hello world!'
    const wrapper = render(<Button>{text}</Button>)

    expect(wrapper.find(select`${Button} > ${Text}`).text()).toBe(text)
  })
})
```

#### Babel

If you have a chanсe to transpile components with this plugin for your unit tests/autotests, you can import React Component as is.

```jsx
import {select} from 'reselector'

import MyComponent from './MyComponent'
import MyButton from './MyButton'

/**
 * [data-dadad] [data-czczx]
 */
console.log(select`${MyComponent} ${MyButton}`)

/**
 * .myClassName > [data-czczx]
 */
console.log(select`.myClassName > ${MyButton}`)
```

#### Runtime (just node.js, without babel)

It may be useful for autotests (for example, with PageObjects) when you don't need to transpile code. Just use `resolve` or `resolveBy` functions to get Components' selector.

```jsx
const {resolve, select} = require('reselector')

const {MyComponent} = resolve(require.resolve('./MyComponent'))
const {MyButton} = resolve(require.resolve('./MyButton'))

/**
 * [data-dadad] [data-czczx]
 */
console.log(select`${MyComponent} ${MyButton}`)

/**
 * .myClassName > [data-czczx]
 */
console.log(select`.myClassName > ${MyButton}`)
```

With `resolveBy`:

```jsx
const {resolveBy, select} = require('reselector')

const resolve = resolveBy(require.resolve)

const {MyComponent} = resolve('./MyComponent')
const {MyButton} = resolve('./MyButton')

/**
 * [data-dadad] [data-czczx]
 */
console.log(select`${MyComponent} ${MyButton}`)

/**
 * .myClassName > [data-czczx]
 */
console.log(select`.myClassName > ${MyButton}`)
```

## How it works

This plugin tries to find all React Component declarations and to add `data-{hash}` attribute with the uniq hash-id to the Component's root node. It also saves this hash as the static property for the Component, so `get` function uses this property to build a selector.


## Configuration

You can provide some options via `reselector.config.js`, rc-files or in `package.json`.

### name

{**string** = 'data-testid'} Test-attribute name, should not be empty.

You can define your own attribute name, for example

```js
module.exports = {name: 'my-test-id'}
```

With that, you'll get attributes on nodes like `<button my-test-id="c7b7156f" />`.

### env

{**boolean** = false} Just set it on `true` to control attributes appending by `process.env.RESELECTOR`. So it will no append hashes at runtime when `process.env.RESELECTOR !== 'true'`.

For example:

```js
module.exports = {env: true}
```

### envName

{**string** = `process.env.BABEL_ENV || process.env.NODE_ENV || 'development'`}

### syntaxes

{**string[]**} By default, this plugin works with these syntax list:

```
@babel/plugin-syntax-async-generators
@babel/plugin-syntax-class-properties
@babel/plugin-syntax-decorators
@babel/plugin-syntax-dynamic-import
@babel/plugin-syntax-export-default-from
@babel/plugin-syntax-export-namespace-from
@babel/plugin-syntax-flow
@babel/plugin-syntax-function-bind
@babel/plugin-syntax-import-meta
@babel/plugin-syntax-jsx
@babel/plugin-syntax-nullish-coalescing-operator
@babel/plugin-syntax-numeric-separator
@babel/plugin-syntax-object-rest-spread
@babel/plugin-syntax-optional-catch-binding
@babel/plugin-syntax-optional-chaining
@babel/plugin-syntax-pipeline-operator
@babel/plugin-syntax-throw-expressions
```

But you can declare your own syntax list, for example:

```js
// .reselectorrc.js

module.exports = {
  syntaxes: [
    '@babel/plugin-syntax-async-generators',
    '@babel/plugin-syntax-class-properties',
    '@babel/plugin-syntax-decorators',
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
    '@babel/plugin-syntax-pipeline-operator',
    '@babel/plugin-syntax-throw-expressions',
  ],
}
```
