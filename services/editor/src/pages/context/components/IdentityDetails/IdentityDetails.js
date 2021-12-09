import * as changeCase from 'change-case';
import { equals } from 'ramda';
import React from 'react';
import DocumentTitle from 'react-document-title';
import { SaveButton } from '../../../../components/common';
import Loader from '../../../../components/Loader';
import { useIdentitySchema } from '../../../../contexts/Schema/Schemas';
import {
  FIXED_PREFIX,
  getContextProperties,
  getFixedKeys,
} from '../../../../contexts/Schema/utils';
import FixedKeys from '../FixedKeys/FixedKeys';
import IdentityProperties from '../IdentityProperties/IdentityProperties';
import './IdentityDetails.css';
import { useIdentityDetails } from './useIdentityDetails';

const addFixedKeysPrefix = (context) =>
  Object.fromEntries(Object.entries(context).map(([prop, value]) => [FIXED_PREFIX + prop, value]));

const IdentityDetails = ({
  match: {
    params: { identityId, identityType },
  },
}) => {
  const { remote, local, isSaving, isLoading, update, save } = useIdentityDetails(
    identityType,
    identityId,
  );

  const schema = useIdentitySchema(identityType);

  const hasChanges = !equals(remote, local);

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
            onClick={save}
            isSaving={isSaving}
            hasChanges={hasChanges}
          />
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <div>
            <IdentityProperties
              className="section"
              identityType={identityType}
              local={getContextProperties(local, schema, true)}
              remote={getContextProperties(remote, schema)}
              updateContext={(context) =>
                update({ ...context, ...addFixedKeysPrefix(getFixedKeys(local)) })
              }
            />

            <FixedKeys
              className="section"
              local={getFixedKeys(local)}
              remote={getFixedKeys(remote)}
              updateContext={(fixedKeys) =>
                update({
                  ...getContextProperties(local, schema, true),
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

export default IdentityDetails;
