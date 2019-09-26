import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import { PolicyEditor, SaveButton } from '../../../../components';
import './FolderEditPage.css';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 16px;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const Box = styled.div`
  background-color: white;
  border-radius: 5px;
  border: 1px solid lightgray;
  padding: 15px;
  box-sizing: border-box;
`;

const PathText = styled.span`
  font-size: 22px;
  color: #515c66;
  margin-left: 4px;
`;

const FolderEditPage = ({ selectedKey, ...props }) => {
  const [policies, setPolicies] = useState('');
  useEffect(() => {
    (async () => {
      const resourcePolicies = await tweekManagementClient.getResourcePolicies(selectedKey.key);
      setPolicies(JSON.stringify(resourcePolicies));
    })();
  }, []);

  return (
    <Container>
      <ActionContainer>
        <SaveButton isValid={true} />
      </ActionContainer>
      <Box>
        <PathText>{selectedKey.key}</PathText>
      </Box>

      <Tabs className="tab-container" selectedIndex={0} onSelect={() => {}}>
        <TabList>
          <Tab className="tab-header">
            <label className="key-source-tab-icon"> </label>
            <label className="tab-title" data-tab-header="policy">
              Policy
            </label>
          </Tab>
        </TabList>

        <TabPanel className="tab-content">
          <PolicyEditor source={policies} />
        </TabPanel>
      </Tabs>
    </Container>
  );
};

export default FolderEditPage;
