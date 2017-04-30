import React, { Component, PropTypes } from 'react';
import { compose, withProps, mapProps, lifecycle } from 'recompose';
import { connect } from 'react-redux';

import filteredPropsValues from '../../utils/filteredPropsValues';
import transformProps from '../../utils/transformProps';

const trimString = value => value.trim()
const padWithFixedPrefix = prop => `@fixed:${prop}`
const filterFixedConfigurationProps = filteredPropsValues(prop => prop.startsWith("@fixed:"));
const removeFixedPrefix = transformProps(prop => prop.replace("@fixed:", ""))
const addFixedPrefix = transformProps(padWithFixedPrefix)
const trimSpaces = transformProps(trimString);

import withContextData from '../../hoc/withContextData/withContextData';
import withUpdateContextData from '../../hoc/withContextData/withUpdateContextData';

import FixedConfigurationTable from './FixedConfigurationTable';

import { getContext, updateContext } from '../../../../store/ducks/context';

const FixedConfiguration = ({ fixedConfigurations, updateContext }) => {
  return (
    <div style={ style.container }>
      <h3 style={{ marginBottom: '1em' }}>Fixed Configuration</h3>
      <FixedConfigurationTable
        onSave={ ({ updatedConfiguration, deletedKeys }) => updateContext({
          updatedConfiguration,
          deletedKeys
        }) }
        fixedConfigurations={ fixedConfigurations } />
    </div>
  )
}

FixedConfiguration.propTypes = {
  fixedConfigurations: PropTypes.object,
  updateContext: PropTypes.func.isRequired,
  contextType: PropTypes.string.isRequired,
  contextId: PropTypes.string.isRequired
}

const style = {
  container: {
    marginLeft: '10px'
  }
}

const mapStateToProps = state => ({
  contextData: state.context.contextData
})

const mapDispatchToProps = (dispatch, props) => ({
  getContext: () => dispatch(getContext({
    contextType: props.contextType,
    contextId: props.contextId
  })),
  updateContext: ({ updatedConfiguration, deletedKeys }) => dispatch(updateContext({
    contextType: props.contextType,
    contextId: props.contextId,
    updatedContextData: addFixedPrefix(trimSpaces(updatedConfiguration)),
    deletedContextKeys: deletedKeys.map(trimString).map(padWithFixedPrefix)
  }))
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  lifecycle({
    componentWillMount(){
      this.props.getContext();
    },

    componentDidUpdate(prev){
      const { props } = this;
      if (props.contextId != prev.contextId || props.contextType != prev.contextType){
        props.getContext();
      }
    }
  }),
  mapProps(props => ({
    ...props,
    fixedConfigurations: removeFixedPrefix(filterFixedConfigurationProps(props.contextData || {}))
  }))
)(FixedConfiguration);