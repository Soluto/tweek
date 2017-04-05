import React, { Component, PropTypes } from 'react';
import { compose, withProps, mapProps } from 'recompose';

import filteredPropsValues from '../../utils/filteredPropsValues';
import transformProps from '../../utils/transformProps';

const filterFixedConfigurationProps = filteredPropsValues(prop => prop.startsWith("@fixed:"));
const removeFixedPrefix = transformProps(prop => prop.replace("@fixed:", ""))

import withContextData from '../../hoc/withContextData/withContextData';
import FixedConfigurationTable from './FixedConfigurationTable';

const FixedConfiguration = ({ fixedConfigurations }) => {
  return (
    <div>
      <FixedConfigurationTable fixedConfigurations={ fixedConfigurations } />
    </div>
  )
}

FixedConfiguration.propTypes = {
  fixedConfigurations: PropTypes.object
}

export default compose(
  withContextData(),
  mapProps(props => ({
    fixedConfigurations: removeFixedPrefix(filterFixedConfigurationProps(props.contextData))
  }))
)(FixedConfiguration);