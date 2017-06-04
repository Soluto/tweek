import React from 'react';
import style from './IdentityPage.css';
import { connect } from 'react-redux';
import IdentityProperty from './IdentityProperty/IdentityProperty';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import R from 'ramda';
import * as schemaActions from '../../../../store/ducks/schema';

const IdentityPage = ({ params: { identityType }, identityProperties, updateIdentityProperty }) => {
  console.log(identityProperties);
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
                R.toPairs(identityProperties).map(([name, type]) =>
                  <IdentityProperty name={name} onUpdate={updateIdentityProperty} key={name} type={type} />,
                )
            }
          </div>
        </TabPanel>
      </Tabs>
    </div>);
};

export default connect(state => ({
  schema: state.schema,
}), schemaActions,
 ({ schema }, actions, props) => ({ identityProperties: schema[props.params.identityType].local, ...props, ...actions }),
)(IdentityPage);
