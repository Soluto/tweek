import styled from '@emotion/styled';
import React from 'react';
import IdentitiesMenu from './IdentitiesMenu';
import { MenuGroup, MenuLinkItem } from './MenuGroup';
import Versions from './Versions';

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 400px;
  overflow: auto;
`;

const Navigation = styled.ul`
  color: #d8d8d8;
  font-size: 16px;
  text-decoration: none;
  display: flex;
  flex-basis: 400px;
  flex-grow: 1;
  flex-direction: column;
  background: #414b53;
`;

const SettingsMenu = () => (
  <Menu>
    <Navigation data-comp="settings-side-bar">
      <MenuGroup name="Identities">
        <IdentitiesMenu />
      </MenuGroup>
      <MenuGroup name="Security">
        <MenuLinkItem to={`/settings/policies`}>Policies</MenuLinkItem>
      </MenuGroup>
      <MenuGroup name="Misc">
        <MenuLinkItem to={`/settings/hooks`}>Hooks</MenuLinkItem>
        <MenuLinkItem to={`/settings/externalApps`}>External Apps</MenuLinkItem>
      </MenuGroup>
    </Navigation>
    <Versions />
  </Menu>
);

export default SettingsMenu;
