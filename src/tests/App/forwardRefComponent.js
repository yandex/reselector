/* @flow */

import React from 'react'

export const withRef = Base => React.forwardRef((props, ref) => <Base {...props} innerRef={ref} />)

const RefComponent = React.forwardRef((props, ref) => <div {...props} ref={ref} />)

export default RefComponent

