import React from 'react'
import { transformFileSync } from 'babel-core'
import { mount } from 'enzyme'

import {
  ClassComponent,
  ArrowFunctionalComponent,
  FunctionalComponent,
} from './App'
import { get } from '../'

describe('babel plugin', () => {
  it('test transformed source code', () => {
    const { code } = transformFileSync(require.resolve('./App'))

    expect(code).toMatchSnapshot()
  })

  it('should find all the types of Components', () => {
    const components = [
      ClassComponent,
      ArrowFunctionalComponent,
      FunctionalComponent,
    ]

    components.forEach((Component) => {
      const wrapper = mount(<div><Component /></div>)

      expect(wrapper).toMatchSnapshot()
      expect(wrapper.find(get`${Component}`).length).toBe(1)
    })
  })

  it('should find nested Component', () => {
    const wrapper = mount((
      <ClassComponent>
        <ArrowFunctionalComponent>
          <FunctionalComponent />
        </ArrowFunctionalComponent>
      </ClassComponent>
    ))

    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(
      get`${ClassComponent} ${ArrowFunctionalComponent} ${FunctionalComponent}`,
    ).length).toBe(1)
  })
})
