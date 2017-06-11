import React from 'react';
import './IdentityPage.css';
import { connect } from 'react-redux';
import IdentityProperty from './IdentityProperty/IdentityProperty';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import R from 'ramda';
import * as schemaActions from '../../../../store/ducks/schema';

const IdentityPropertiesEditor = ({ identityProperties, onPropertyUpdate }) =>
  <div className="property-types-list">
    {R.toPairs(identityProperties).map(([name, type]) =>
      <IdentityProperty
        name={name}
        onUpdate={prop => onPropertyUpdate(name, prop)}
        key={name}
        type={type}
      />,
    )}
  </div>;

const IdentityPage = ({ identityType, identityProperties, updateIdentityProperty }) => {
  const changes =
    R.symmetricDifference(identityProperties.local, identityProperties.remote).length === 0;
  const hasChanges = (changes || []).length > 0;

  return (
    <div className="identity-page">
      <SaveButton
        data-comp="save-button"
        hasChanges={hasChanges}
        isSaving={false}
        onclick={() => {}}
      />
      <h3 style={{ textTransform: 'capitalize' }}>{identityType}</h3>
      <Tabs>
        <TabList>
          <Tab selected>Properties</Tab>
          <Tab disabled>Permissions</Tab>
        </TabList>
        <TabPanel>
          <IdentityPropertiesEditor
            identityProperties={identityProperties.local}
            onPropertyUpdate={updateIdentityProperty}
          />
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
