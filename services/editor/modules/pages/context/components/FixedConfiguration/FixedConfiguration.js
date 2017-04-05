import React, { Component } from 'react';
import { compose, withProps } from 'recompose';

import withContextData from '../../hoc/withContextData/withContextData';

const FixedConfiguration = props => {
  return (
    <div>
      <p>This is the fixed configuration</p>
    </div>
  )
}

const enhanceWithFakeProps = () => withProps({
  contextType: 'device',
  contextId: 'tal'
})

export default compose(
  enhanceWithFakeProps(),
  withContextData()
)(FixedConfiguration);