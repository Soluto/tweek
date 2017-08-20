import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps, lifecycle } from 'recompose';
import changeCase from 'change-case';
import * as contextActions from '../../../../store/ducks/context';
import FixedKeys from '../FixedKeys/FixedKeys';
import IdentityProperties from '../IdentityProperties/IdentityProperties';
import './IdentityDetails.css';

const IdentityDetails = ({ identityId, identityType, isGettingContext }) =>
  <div
    className="identity-details-container"
    data-comp="identity-details"
    data-identity-id={identityId}
    data-identity-type={identityType}
  >
    <div className="identity-title">
      <div className="identity-id">
        {identityId}
      </div>
      <div className="identity-type">
        {changeCase.pascalCase(identityType)}
      </div>
    </div>
    {isGettingContext
      ? 'Loading...'
      : <div>
          <IdentityProperties className="section" identityType={identityType} />
          <FixedKeys className="section" {...{ identityType, identityId }} />
        </div>}
  </div>;

export default compose(
  mapProps(props => props.match.params),
  connect(state => state.context, contextActions),
  mapProps(({ getContext, ...props, identityType, identityId }) => ({
    ...props,
    getContext: () => getContext({ identityType, identityId }),
  })),
  lifecycle({
    componentWillMount() {
      this.props.getContext();
    },
    componentWillReceiveProps(nextProps) {
      const { props } = this;
      if (
        props.identityId !== nextProps.identityId ||
        props.identityType !== nextProps.identityType
      ) {
        nextProps.getContext();
      }
    },
  }),
)(IdentityDetails);
