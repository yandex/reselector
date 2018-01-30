# babel-plugin-autotest

## Usage

Add `babel-plugin-autotest` to plugin list in `.babelrc`. For example:

```js
{
    presets: ['react'],
    env: {
        test: {
            plugins: [
                'autotest',
            ],
        },
    },
}
```

Use `get` function to build any css selector by React Components.

```jsx
import {get} from 'babel-plugin-autotest'

import MyComponent from './MyComponent'
import MyButton from './MyButton'

/**
 * [data-test="dadad"] [data-test="czczxc"]
 */
console.log(get`${MyComponent} ${MyButton}`)

/**
 * .myClassName > [data-test="czczxc"]
 */
console.log(get`.myClassName > ${MyButton}`)
```

## How it works

This plugin tries to find all React Component declarations, and to add `data-test` attribute to the Component's root node with the uniq hash-id. It also saves this id as the static property for this Component, so `get` function uses this property to build a selector.
