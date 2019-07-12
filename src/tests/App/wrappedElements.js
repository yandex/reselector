import React from 'react'

const id = x => x

export default function WrappedElements({ children }) {
  return id(
    <div>
      {children}
    </div>,
  )
}
