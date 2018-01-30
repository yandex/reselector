/* eslint-disable react/prefer-stateless-function */

import React from 'react'

export class ClassComponent extends React.Component {
  render() {
    return <div>{this.props.children}</div>
  }
}

export const ArrowFunctionalComponent = ({ children }) => (
  <div>{children}</div>
)

export function FunctionalComponent({ children }) {
  return <p>{children}</p>
}
