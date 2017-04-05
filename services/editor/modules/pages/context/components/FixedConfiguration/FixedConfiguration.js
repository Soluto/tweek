import React, { Component, PropTypes } from 'react';
import { compose, withProps, mapProps } from 'recompose';

import filteredPropsValues from '../../utils/filteredPropsValues';
import transformProps from '../../utils/transformProps';

const filterFixedConfigurationProps = filteredPropsValues(prop => prop.startsWith("@fixed:"));
const removeFixedPrefix = transformProps(prop => prop.replace("@fixed:", ""))
const addFixedPrefix = transformProps(prop => `@fixed:${prop}`)

import withContextData from '../../hoc/withContextData/withContextData';
import withUpdateContextData from '../../hoc/withContextData/withUpdateContextData';

import FixedConfigurationTable from './FixedConfigurationTable';

const FixedConfiguration = ({ fixedConfigurations, updateContext }) => {
  return (
    <div>
      <FixedConfigurationTable onSave={ data => updateContext(addFixedPrefix(data)) } fixedConfigurations={ fixedConfigurations } />
    </div>
  )
}

FixedConfiguration.propTypes = {
  fixedConfigurations: PropTypes.object,
  updateContext: PropTypes.func.isRequired,
  contextType: PropTypes.string.isRequired,
  contextId: PropTypes.string.isRequired
}

export default compose(
  withContextData(),
  withUpdateContextData(),
  mapProps(props => ({
    ...props,
    fixedConfigurations: removeFixedPrefix(filterFixedConfigurationProps(props.contextData))
  }))
)(FixedConfiguration);