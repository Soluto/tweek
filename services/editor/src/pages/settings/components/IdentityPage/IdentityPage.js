import { equals } from 'ramda';
import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { SaveButton } from '../../../../components/common';
import { useLocalSchema } from '../../../../contexts/Schema/LocalSchemas';
import './IdentityPage.css';
import { IdentityPropertyItem, NewIdentityProperty } from './IdentityProperty/IdentityProperty';

const IdentityPropertiesEditor = ({ identityProperties, onPropertyUpdate, onPropertyRemove }) => (
  <div className="property-types-list">
    {Object.entries(identityProperties).map(([name, def]) => (
      <IdentityPropertyItem
        name={name}
        onUpdate={(newDef) => onPropertyUpdate(name, newDef)}
        onRemove={() => onPropertyRemove(name)}
        key={name}
        def={def}
      />
    ))}
  </div>
);

const IdentityPage = ({
  match: {
    params: { identityType },
  },
}) => {
  const {
    remote,
    local,
    isSaving,
    saveIdentity,
    deleteIdentity,
    setProperty,
    removeProperty,
  } = useLocalSchema(identityType);
  const hasChanges = !equals(local, remote);

  return (
    <div className="identity-page" data-identity-type={identityType}>
      <div data-comp="action-bar">
        <SaveButton
          data-comp="save-button"
          hasChanges={hasChanges}
          isSaving={isSaving}
          onClick={saveIdentity}
        />
        {remote && (
          <button data-comp="delete-identity" onClick={deleteIdentity}>
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
              identityProperties={local}
              onPropertyUpdate={setProperty}
              onPropertyRemove={removeProperty}
            />
            <NewIdentityProperty onCreate={setProperty} />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default IdentityPage;
