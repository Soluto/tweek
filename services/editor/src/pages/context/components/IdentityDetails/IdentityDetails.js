import React from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import { compose, mapProps, lifecycle } from 'recompose';
import changeCase from 'change-case';
import * as R from 'ramda';
import { getContext, saveContext, updateContext } from '../../../../store/ducks/context';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import FixedKeys from '../FixedKeys/FixedKeys';
import IdentityProperties from '../IdentityProperties/IdentityProperties';
import './IdentityDetails.css';
import {
  getFixedKeys,
  getContextProperties,
  FIXED_PREFIX,
} from '../../../../services/context-service';

const IdentityDetails = ({
  identityId,
  identityType,
  isGettingContext,
  updateContext,
  saveContext,
  hasChanges,
  isSavingContext,
  local,
  remote,
}) => (
  <DocumentTitle title={`Tweek - ${identityType} - ${identityId}`}>
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
          <IdentityProperties
            className="section"
            identityType={identityType}
            local={getContextProperties(identityType, local, true)}
            remote={getContextProperties(identityType, remote)}
            updateContext={context =>
              updateContext({ ...context, ...addFixedKeysPrefix(getFixedKeys(local)) })
            }
          />

          <FixedKeys
            className="section"
            local={getFixedKeys(local)}
            remote={getFixedKeys(remote)}
            updateContext={fixedKeys =>
              updateContext({
                ...getContextProperties(identityType, local, true),
                ...addFixedKeysPrefix(fixedKeys),
              })
            }
          />
        </div>
      )}
    </div>
  </DocumentTitle>
);

const addFixedKeysPrefix = R.pipe(
  R.toPairs,
  R.map(([prop, value]) => [FIXED_PREFIX + prop, value]),
  R.fromPairs,
);

export default compose(
  mapProps(props => props.match.params),
  connect(state => state.context, { getContext, saveContext, updateContext }),
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
