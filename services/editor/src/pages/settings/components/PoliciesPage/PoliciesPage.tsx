import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import AclPolicies from "./ACL";
import JWTExtraction from "./JWTExtraction";
import "./PoliciesPage.css";

export default ()=>
  <div className="policies-page">
      <h3 style={{ textTransform: 'capitalize' }}>Policies</h3>
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