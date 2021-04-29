import React from 'react';
import styled from '@emotion/styled';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import AclPolicies from './ACL';
import JWTExtraction from './JWTExtraction';
import './PoliciesPage.css';

const Title = styled.h3`
  text-transform: capitalize;
`;

const PoliciesPage = () => (
  <div className="policies-page">
    <Title>Policies</Title>
    <Tabs>
      <TabList>
        <Tab selected>ACL</Tab>
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

export default PoliciesPage;
