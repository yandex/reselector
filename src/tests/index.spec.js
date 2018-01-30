import React from 'react'
import { transformFileSync } from 'babel-core'
import { mount } from 'enzyme'

import {
  ClassComponent,
  ArrowFunctionalComponent,
  FunctionalComponent,
  ComposedComponent,
} from './App'
import { get } from '../'

jest.mock('shortid')

describe('babel plugin', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test'
  })

  it('should transform source code well for development', () => {
    const { code } = transformFileSync(require.resolve('./App'))

    expect(code).toMatchSnapshot()
  })

  it('should transform source code well for production', () => {
    process.env.NODE_ENV = 'production'

    let hash = 0
    const shortid = require('shortid')
    shortid.generate.mockImplementation(() => `shortid-${hash++}`)

    const { code } = transformFileSync(require.resolve('./App'))

    expect(code).toMatchSnapshot()
  })

  it('should find all the types of Components', () => {
    const components = [
      ClassComponent,
      ArrowFunctionalComponent,
      FunctionalComponent,
      ComposedComponent,
    ]

    components.forEach((Component) => {
      const wrapper = mount(<div><Component /></div>)

      const selector = get`${Component}`

      expect(wrapper).toMatchSnapshot()
      expect(wrapper.find(selector).hostNodes().length).toBe(1)
    })
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

    const selector = get`${ClassComponent} ${ArrowFunctionalComponent} ${FunctionalComponent} ${ComposedComponent}`

    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(selector).hostNodes().length).toBe(1)
  })
})
