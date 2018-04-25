import React from 'react'
import { select } from '../'

const Text = ({ children }) => <p>{children}</p>
const Button = ({ children }) => <button><Text>{children}</Text></button>

describe('select', () => {
  it('should build css selector', () => {
    const selector = select`${Button} > ${Text}`

    expect(selector).toMatchSnapshot()
    expect(select.css`${Button} > ${Text}`).toEqual(selector)
  })

  it('should build xpath selector', () => {
    expect(select.xpath`//${Button}/${Text}`).toMatchSnapshot()
  })
})
