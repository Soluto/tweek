import React, { Component, PropTypes } from 'react';
import { compose, withProps, mapProps, lifecycle } from 'recompose';
import { connect } from 'react-redux';

import filteredPropsValues from '../../utils/filteredPropsValues';
import transformProps from '../../utils/transformProps';

const filterFixedConfigurationProps = filteredPropsValues(prop => prop.startsWith("@fixed:"));
const removeFixedPrefix = transformProps(prop => prop.replace("@fixed:", ""))
const addFixedPrefix = transformProps(prop => `@fixed:${prop}`)

import withContextData from '../../hoc/withContextData/withContextData';
import withUpdateContextData from '../../hoc/withContextData/withUpdateContextData';

import FixedConfigurationTable from './FixedConfigurationTable';

import { getContext, updateContext } from '../../../../store/ducks/context';

const FixedConfiguration = ({ fixedConfigurations, updateContext }) => {
  return (
    <div style={ style.container }>
      <h3>Fixed Configuration</h3>
      <FixedConfigurationTable
        onSave={ data => updateContext(addFixedPrefix(data)) }
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
  updateContext: contextData => dispatch(updateContext({
    contextType: props.contextType,
    contextId: props.contextId,
    contextData 
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