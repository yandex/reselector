import React, { Component } from 'react'

// eslint-disable-next-line
export default class DefaultClass extends Component {
  render() {
    return (<div>{ this.props.children}</div>)
  }
}
