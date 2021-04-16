import styled from '@emotion/styled';
import React from 'react';
import DocumentTitle from 'react-document-title';
import SettingsMenu from './SettingsMenu';

const PageContainer = styled.div`
  display: flex;
  flex-grow: 1;
  background-color: #eee;
`;

const Main = styled.div`
  display: flex;
  flex-grow: 1;
  overflow-y: auto;
`;

const SettingsPage = ({ children }) => (
  <DocumentTitle title="Tweek - Settings">
    <PageContainer>
      <SettingsMenu />
      <Main>{children}</Main>
    </PageContainer>
  </DocumentTitle>
);

export default SettingsPage;
