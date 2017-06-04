import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps, lifecycle } from 'recompose';
import changeCase from 'change-case';
import * as contextActions from '../../../../store/ducks/context';
import FixedKeys from '../FixedKeys/FixedKeys';
import IdentityProperties from '../IdentityProperties/IdentityProperties';
import './IdentityDetails.css';

const IdentityDetails = ({
  identityId,
  identityName,
  isGettingContext,
  updateFixedKeys,
  fixedKeys,
  isUpdatingContext,
  properties,
}) =>
  <div className={'context-details-container'}>
    <div className={'context-title'}>
      <div className={'context-id'}>{identityId}</div>
      <div className={'context-type'}>{changeCase.pascalCase(identityName)}</div>
    </div>
    {isGettingContext
      ? 'Loading...'
      : <div>
          <IdentityProperties className={'section'} {...{ identityName, properties }} />
          <FixedKeys className={'section'} {...{ updateFixedKeys, fixedKeys, isUpdatingContext }} />
        </div>}
  </div>;

export default compose(
  mapProps(props => props.match.params),
  connect(state => state.context, contextActions),
  mapProps(({ getContext, updateFixedKeys, identityName, identityId, ...props }) => ({
    ...props,
    identityName,
    identityId,
    getContext: () => getContext({ identityName, identityId }),
    updateFixedKeys: fixedKeys => updateFixedKeys({ identityName, identityId, fixedKeys }),
  })),
  lifecycle({
    componentWillMount() {
      this.props.getContext();
    },
    componentWillReceiveProps(nextProps) {
      const { props } = this;
      if (
        props.identityId !== nextProps.identityId ||
        props.identityName !== nextProps.identityName
      ) {
        nextProps.getContext();
      }
    },
  }),
)(IdentityDetails);
