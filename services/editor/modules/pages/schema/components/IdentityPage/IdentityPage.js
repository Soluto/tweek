import React from 'react';
import style from './IdentityPage.css';
import { connect } from 'react-redux';
import PropertyType from './PropertyType/PropertyType';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';

const IdentityPage = ({ params: { identityType }, allProperties }) => {
  const propertyTypes = allProperties.filter(property => (property.identity === identityType));

  return (
    <div className={style['identity-page']}>
      <SaveButton data-comp="save-button" hasChanges={false} isSaving={false} onclick={() => {}} />
      <h3 style={{ textTransform: 'capitalize' }}>{identityType}</h3>
      <Tabs>
        <TabList>
          <Tab selected>Properties</Tab>
          <Tab disabled>Permissions</Tab>
        </TabList>
        <TabPanel>
          <div className={style['property-types-list']}>
            {
                propertyTypes.map((property, i) =>
                  <PropertyType key={i} property={property} />,
                )
            }
          </div>
        </TabPanel>
      </Tabs>
    </div>);
};

export default connect(state => ({
  allProperties: state.schema.properties,
}))(IdentityPage);
