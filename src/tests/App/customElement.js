import React from 'react'

export default function CustomElement({ tag: Wrapper = 'div', children }) {
  return (
    <Wrapper>
      {children}
    </Wrapper>
  )
}
