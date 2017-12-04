import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps, lifecycle } from 'recompose';
import changeCase from 'change-case';
import * as R from 'ramda';
import { getContext, saveContext } from '../../../../store/ducks/context';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import FixedKeys from '../FixedKeys/FixedKeys';
import IdentityProperties from '../IdentityProperties/IdentityProperties';
import './IdentityDetails.css';

const IdentityDetails = ({
  identityId,
  identityType,
  isGettingContext,
  saveContext,
  hasChanges,
  isSavingContext,
}) => (
  <div
    className="identity-details-container"
    data-comp="identity-details"
    data-identity-id={identityId}
    data-identity-type={identityType}
  >
    <div className="identity-title">
      <div className="identity-id">{identityId}</div>
      <div className="identity-type">{changeCase.pascalCase(identityType)}</div>
      <SaveButton
        data-comp="save-changes"
        onClick={saveContext}
        isSaving={isSavingContext}
        hasChanges={hasChanges}
      />
    </div>
    {isGettingContext ? (
      'Loading...'
    ) : (
      <div>
        <IdentityProperties className="section" identityType={identityType} />
        <FixedKeys className="section" {...{ identityType, identityId }} />
      </div>
    )}
  </div>
);

export default compose(
  mapProps(props => props.match.params),
  connect(state => state.context, { getContext, saveContext }),
  mapProps(({ getContext, saveContext, identityType, identityId, ...props }) => ({
    ...props,
    identityType,
    identityId,
    hasChanges: !R.equals(props.remote, props.local),
    getContext: () => getContext({ identityType, identityId }),
    saveContext: () => saveContext({ identityType, identityId }),
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
