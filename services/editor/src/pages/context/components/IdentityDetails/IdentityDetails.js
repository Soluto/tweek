import * as changeCase from 'change-case';
import * as R from 'ramda';
import React, { useEffect } from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import {
  FIXED_PREFIX,
  getContextProperties,
  getFixedKeys,
} from '../../../../services/context-service';
import { getContext, saveContext, updateContext } from '../../../../store/ducks/context';
import FixedKeys from '../FixedKeys/FixedKeys';
import IdentityProperties from '../IdentityProperties/IdentityProperties';
import './IdentityDetails.css';

const addFixedKeysPrefix = R.pipe(
  R.toPairs,
  R.map(([prop, value]) => [FIXED_PREFIX + prop, value]),
  R.fromPairs,
);

const IdentityDetails = ({
  match: {
    params: { identityId, identityType },
  },
  isGettingContext,
  updateContext,
  saveContext,
  isSavingContext,
  local,
  remote,
  getContext,
}) => {
  useEffect(() => {
    getContext({ identityType, identityId });
  }, [identityId, identityType]); //eslint-disable-line react-hooks/exhaustive-deps

  const hasChanges = !R.equals(remote, local);

  return (
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
            onClick={() => saveContext({ identityType, identityId })}
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
              updateContext={(context) =>
                updateContext({ ...context, ...addFixedKeysPrefix(getFixedKeys(local)) })
              }
            />

            <FixedKeys
              className="section"
              local={getFixedKeys(local)}
              remote={getFixedKeys(remote)}
              updateContext={(fixedKeys) =>
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
};

const enhance = connect((state) => state.context, { getContext, saveContext, updateContext });

export default enhance(IdentityDetails);
