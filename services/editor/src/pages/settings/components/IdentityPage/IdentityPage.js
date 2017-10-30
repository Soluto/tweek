import React from 'react';
import './IdentityPage.css';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as R from 'ramda';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import * as schemaActions from '../../../../store/ducks/schema';
import { IdentityPropertyItem, NewIdentityProperty } from './IdentityProperty/IdentityProperty';

const IdentityPropertiesEditor = ({ identityProperties, onPropertyUpdate, onPropertyRemove }) => (
  <div className="property-types-list">
    {R.toPairs(identityProperties).map(([name, def]) => (
      <IdentityPropertyItem
        name={name}
        onUpdate={newDef => onPropertyUpdate(name, newDef)}
        onRemove={() => onPropertyRemove(name)}
        key={name}
        def={def}
      />
    ))}
  </div>
);

const IdentityPage = ({
  identityType,
  identityProperties,
  upsertIdentityProperty,
  removeIdentityProperty,
  deleteIdentity,
  saveSchema,
}) => {
  const hasChanges = !R.equals(identityProperties.local, identityProperties.remote);

  return (
    <div className="identity-page">
      <div data-comp="action-bar">
        <SaveButton
          data-comp="save-button"
          hasChanges={hasChanges}
          isSaving={identityProperties.isSaving}
          onClick={() => saveSchema(identityType)}
        />
        {identityProperties.remote && (
          <button data-comp="delete-identity" onClick={() => deleteIdentity(identityType)}>
            Delete
          </button>
        )}
      </div>
      <h3 style={{ textTransform: 'capitalize' }}>{identityType}</h3>
      <Tabs>
        <TabList>
          <Tab selected>Properties</Tab>
        </TabList>
        <TabPanel>
          <div className="property-section">
            <IdentityPropertiesEditor
              identityProperties={identityProperties.local}
              onPropertyUpdate={upsertIdentityProperty.papp(identityType)}
              onPropertyRemove={removeIdentityProperty.papp(identityType)}
            />
            <NewIdentityProperty onCreate={upsertIdentityProperty.papp(identityType)} />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default connect(
  state => ({
    schema: state.schema,
  }),
  schemaActions,
  ({ schema }, actions, { match: { params: { identityType } }, ...props }) => ({
    identityProperties: schema[identityType],
    identityType,
    ...props,
    ...actions,
  }),
)(IdentityPage);
