import React from 'react';
import styled from '@emotion/styled';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useHistory } from 'react-router';
import AclPolicies from './ACL';
import JWTExtraction from './JWTExtraction';
import './PoliciesPage.css';

const Title = styled.h3`
  text-transform: capitalize;
`;

export default () => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const selectedTab = Number(params.get('tab') || 0);

  return (
    <div className="policies-page">
      <Title>Policies</Title>
      <Tabs
        selectedIndex={selectedTab}
        onSelect={(index) => {
          params.set('tab', index);
          history.replace({ ...history.location, search: params.toString() });
        }}
      >
        <TabList>
          <Tab>ACL</Tab>
          <Tab>JWT Extraction</Tab>
        </TabList>
        <TabPanel>
          <AclPolicies />
        </TabPanel>
        <TabPanel>
          <JWTExtraction />
        </TabPanel>
      </Tabs>
    </div>
  );
};
