import React from 'react'

/* eslint-disable-next-line no-unused-vars */
export const ternaryRender = ({ children, flag }) => (
  flag
    ? (<div>{children}</div>)
    : (<a>{children}</a>)
)

/* eslint-disable-next-line no-unused-vars */
export const conditionalRender = ({ children, flag }) =>
  flag && (<div>{children}</div>)

/* eslint-disable-next-line no-unused-vars */
export const ifRender = ({ children, flag }) => {
  if (flag) {
    return (<div>{children}</div>)
  }

  return null
}
