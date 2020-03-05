import React from 'react'
import { select, resolve } from '../'


describe('select', () => {
  const Text = ({ children }) => <p>{children}</p>
  const Button = ({ children }) => <button><Text>{children}</Text></button>

  it('should build css selector', () => {
    const selector = select`${Button} > ${Text}`

    expect(selector).toMatchSnapshot()
    expect(select.css`${Button} > ${Text}`).toEqual(selector)
  })

  it('should build xpath selector', () => {
    expect(select.xpath`//*${Button}/${Text}`).toMatchSnapshot()
  })

  it('should work with variables', () => {
    const index = 0

    expect(select`${Button} > ${Text}:nth-child(${index})`).toMatchSnapshot()
  })
})

describe('select modifiers', () => {
  const componentName = 'Button'
  const path = require.resolve('./App')

  const defaultSelector = resolve(path)[componentName]

  const defaultSelectCssMod = selector => `${selector}[href]`
  const defaultSelectXpathMod = selector => `${selector}[href]`

  const selectExpectedCssMod = selector => `${select.css`${selector}`}[href]`
  const selectExpectedXpathMod = selector => `${select.xpath`${selector}`}[href]`

  // eslint-disable-next-line no-restricted-syntax, no-shadow
  for (const {
    title,
    selectCssMod,
    selectXpathMod,
    expectedCss,
    expectedXpath,
  } of Object.values([
      {
        title: 'should modify a selector when modifier is defined',

        selectCssMod: defaultSelectCssMod,
        selectXpathMod: defaultSelectXpathMod,

        expectedCss: selectExpectedCssMod(defaultSelector),
        expectedXpath: selectExpectedXpathMod(defaultSelector),
      },
      {
        title: 'should not modify a selector when modifier is not defined',

        selectCssMod: undefined,
        selectXpathMod: undefined,

        expectedCss: select.css`${defaultSelector}`,
        expectedXpath: select.xpath`${defaultSelector}`,
      },
    ])) {
    jest.resetModules()

    // eslint-disable-next-line no-shadow
    require('../config').selectors = (map, resolve) => {
      const Component = resolve(path)[componentName]

      map.css(Component, selectCssMod)
      map.xpath(Component, selectXpathMod)
    }

    const { css, xpath } = require('../select')

    it(title, () => {
      const selector = resolve(path)[componentName]

      expect(css`${selector}`).toBe(expectedCss)
      expect(xpath`${selector}`).toBe(expectedXpath)
    })
  }
})
