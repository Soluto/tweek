import React, { PropTypes } from 'react';
import { compose, mapProps, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import filteredPropsValues from '../../../utils/filteredPropsValues';
import transformProps from '../../../utils/transformProps';
import { getContext, updateContext } from '../../../../../store/ducks/context';
import FixedKeysList from './FixedKeysList/FixedKeysList';

const trimString = value => value.trim();
const padWithFixedPrefix = prop => `@fixed:${prop}`;
const filterFixedConfigurationProps = filteredPropsValues(prop => prop.startsWith('@fixed:'));
const removeFixedPrefix = transformProps(prop => prop.replace('@fixed:', ''));
const addFixedPrefix = transformProps(padWithFixedPrefix);
const trimSpaces = transformProps(trimString);

const style = {
  container: {
    marginLeft: '10px',
  },
};

const FixedKeys = ({ fixedKeys, updateContext: onSave }) => (
  <div style={style.container}>
    <h3 style={{ marginBottom: '1em' }}>Fixed Configuration</h3>
    <FixedKeysList
      onSave={onSave}
      fixedKeys={fixedKeys}
    />
  </div>
);

FixedKeys.propTypes = {
  fixedKeys: PropTypes.object.isRequired,
  updateContext: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  contextData: state.context.contextData,
});

const mapDispatchToProps = (dispatch, props) => ({
  getContext: () => dispatch(getContext({
    contextType: props.contextType,
    contextId: props.contextId,
  })),
  updateContext: updatedConfiguration => dispatch(updateContext({
    contextType: props.contextType,
    contextId: props.contextId,
    updatedContextData: addFixedPrefix(trimSpaces(updatedConfiguration)),
  })),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  lifecycle({
    componentWillMount() {
      this.props.getContext();
    },

    componentDidUpdate(prev) {
      const { props } = this;
      if (props.contextId !== prev.contextId || props.contextType !== prev.contextType) {
        props.getContext();
      }
    },
  }),
  mapProps(props => ({
    ...props,
    fixedKeys: removeFixedPrefix(filterFixedConfigurationProps(props.contextData || {})),
  })),
)(FixedKeys);
