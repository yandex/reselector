import React from 'react'
import { transformFileAsync } from '@babel/core'
import { mount } from 'enzyme'

import {
  ClassComponent,
  ArrowFunctionalComponent,
  FunctionalComponent,
  ComposedComponent,
  ComposedComponent2,
  ComponentWithAttrs,
  SpreadPropsComponent,
} from './App'
import defaultNamedClassComponent from './App/defaultNamedClassExport'
import defaultDeclaredNamedClassComponent from './App/defaultDeclaredNamedClassExport'
import wrappedElementsComponent from './App/wrappedElements'
import CustomElement from './App/customElement'
import ForwardRefComponent from './App/forwardRefComponent'
import { select } from '../'

describe('babel plugin', () => {
  describe('transform', () => {
    let config = {}

    beforeEach(() => {
      config = {}

      jest.doMock('../config', () => new Proxy(jest.requireActual('../config'), {
        get: (target, value) => (value in config ? config[value] : target[value]),
      }))
    })

    it('should transform source code well for development', async () => {
      const { code } = await transformFileAsync(require.resolve('./App'))

      expect(code).toMatchSnapshot()
    })

    it('should transform source code depends on the env option', async () => {
      config.env = true

      const { code } = await transformFileAsync(require.resolve('./App'))

      expect(code).toMatchSnapshot()
    })

    it('should transform default anonymous function', async () => {
      const { code } = await transformFileAsync(require.resolve('./App/defaultAnonymousFunctionExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform default named function', async () => {
      const { code } = await transformFileAsync(require.resolve('./App/defaultNamedFunctionExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform default named class', async () => {
      const { code } = await transformFileAsync(require.resolve('./App/defaultNamedClassExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform declared named class in default', async () => {
      const { code } = await transformFileAsync(require.resolve('./App/defaultDeclaredNamedClassExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform conditionals functions', async () => {
      const { code } = await transformFileAsync(require.resolve('./App/conditionalRenderComponents'))

      expect(code).toMatchSnapshot()
    })

    it('should transform forwardRef right', async () => {
      const { code } = await transformFileAsync(require.resolve('./App/forwardRefComponent'))

      expect(code).toMatchSnapshot()
    })
  })

  it('should find all the types of Components', () => {
    const components = [
      ClassComponent,
      ArrowFunctionalComponent,
      FunctionalComponent,
      ComposedComponent,
      ComponentWithAttrs,
      defaultNamedClassComponent,
      defaultDeclaredNamedClassComponent,
      SpreadPropsComponent,
      wrappedElementsComponent,
      CustomElement,
      ForwardRefComponent,
    ]

    components.forEach((Component) => {
      const wrapper = mount(<div><Component /></div>)

      const selector = select`${Component}`

      expect(wrapper).toMatchSnapshot()
      expect(wrapper.find(selector).hostNodes().length).toBe(1)
    })
  })

  it('should save Component`s root attrs', () => {
    const wrapper = mount(<ComponentWithAttrs />)
    const selector = select`${ComponentWithAttrs}`

    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(selector).getDOMNode().dataset).toMatchSnapshot()
  })

  it('should find nested Component', () => {
    const wrapper = mount((
      <ClassComponent>
        <ArrowFunctionalComponent>
          <FunctionalComponent>
            <ComposedComponent />
          </FunctionalComponent>
        </ArrowFunctionalComponent>
      </ClassComponent>
    ))

    const selector = select`
      ${ClassComponent}
      ${ArrowFunctionalComponent}
      ${FunctionalComponent}
      ${ComposedComponent}
    `

    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(selector).hostNodes().length).toBe(1)
  })

  it('should pass props through the React.Fragment', async () => {
    const { code } = await transformFileAsync(require.resolve('./App/reactFragment'))

    expect(code).toMatchSnapshot()

    const Fragments = require('./App/reactFragment')

    Object.values(Fragments).forEach((Component) => {
      const wrapper = mount(<Component />)

      const selector = select`${Component}`

      expect(wrapper).toMatchSnapshot()
      expect(wrapper.find(selector).hostNodes().length).toBe(1)
    })
  })

  it('should find wrapped component', () => {
    const text = 'test text'
    const wrapper = mount(<ComposedComponent2>{text}</ComposedComponent2>)
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(select`${ComposedComponent2}`).hostNodes().text()).toBe(text)
  })
})
