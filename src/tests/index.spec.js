import React from 'react'
import { transformFileSync } from 'babel-core'
import { mount } from 'enzyme'

import {
  ClassComponent,
  ArrowFunctionalComponent,
  FunctionalComponent,
  ComposedComponent,
  ComponentWithAttrs,
} from './App'
import { select } from '../'

describe('babel plugin', () => {
  it('should transform source code well for development', () => {
    const { code } = transformFileSync(require.resolve('./App'))

    expect(code).toMatchSnapshot()
  })

  it('should find all the types of Components', () => {
    const components = [
      ClassComponent,
      ArrowFunctionalComponent,
      FunctionalComponent,
      ComposedComponent,
      ComponentWithAttrs,
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
})
