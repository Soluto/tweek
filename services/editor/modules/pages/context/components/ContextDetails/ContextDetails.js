import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps, lifecycle } from 'recompose';
import changeCase from 'change-case';
import * as contextActions from '../../../../store/ducks/context';
import FixedKeys from '../FixedKeys/FixedKeys';
import style from './ContextDetails.css';

const ContextDetails = ({ contextId, contextType, isGettingContext, updateFixedKeys, fixedKeys, isUpdatingContext }) => (
  <div className={style['context-details-container']}>
    <div className={style['context-title']}>
      <div className={style['context-id']}>{contextId}</div>
      <div className={style['context-type']}>{changeCase.pascalCase(contextType)}</div>
    </div>
    {
      isGettingContext ? 'Loading...' : <FixedKeys {...{ updateFixedKeys, fixedKeys, isUpdatingContext }} />
    }
  </div>
);

export default compose(
  mapProps(props => props.params),
  connect(state => state.context, contextActions),
  mapProps(({ getContext, updateFixedKeys, contextType, contextId, ...props }) => ({
    ...props,
    contextType,
    contextId,
    getContext: () => getContext({ contextType, contextId }),
    updateFixedKeys: fixedKeys => updateFixedKeys({ contextType, contextId, fixedKeys }),
  })),
  lifecycle({
    componentWillMount() {
      this.props.getContext();
    },
    componentWillReceiveProps(nextProps) {
      const { props } = this;
      if (props.contextId !== nextProps.contextId || props.contextType !== nextProps.contextType) {
        nextProps.getContext();
      }
    },
  }),
)(ContextDetails);
