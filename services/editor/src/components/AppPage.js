import styled from '@emotion/styled';
import React from 'react';
import Alerts from './alerts/Alerts';
import Notifications from './alerts/Notifications';

const PageContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
`;

const AppPage = ({ children }) => (
  <PageContainer>
    {children}
    <Alerts />
    <Notifications />
  </PageContainer>
);

export default AppPage;
