# reselector

[![Travis branch](https://img.shields.io/travis/lttb/reselector/master.svg?style=flat)](https://travis-ci.org/lttb/reselector)
[![Coverage Status branch](https://img.shields.io/coveralls/lttb/reselector/master.svg?style=flat)](https://img.shields.io/coveralls/lttb/reselector/master.svg?branch=master)
[![npm version](https://img.shields.io/npm/v/reselector.svg?style=flat)](https://www.npmjs.com/package/reselector)
[![npm license](https://img.shields.io/npm/l/reselector.svg?style=flat)](https://www.npmjs.com/package/reselector)

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

#### Runtime (node.js)

Use `resolve` or `resolveBy` functions to get Components' selector.

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

## How it works

This plugin tries to find all React Component declarations and to add `data-{hash}` attribute with the uniq hash-id to the Component's root node. It also saves this hash as the static property for the Component, so `get` function uses this property to build a selector.
