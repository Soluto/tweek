import styled from '@emotion/styled';
import React from 'react';
import { Link } from 'react-router-dom';
import logoSrc from '../resources/logo.svg';
import UserBar from '../UserBar';
import ListItemLink from './ListItemLink';

const HeaderContainer = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  background-color: #009fda;
`;

const MenuWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-grow: 1;
  height: 100%;
`;

const Menu = styled.ul`
  display: flex;
  flex-grow: 1;
  margin-right: 10px;
  justify-content: flex-end;

  li {
    list-style: none;
  }
`;

const Logo = styled.img`
  margin: 5px 0 0 20px;
  width: 140px;
`;

const AppHeader = () => (
  <HeaderContainer>
    <Link to="/" replace>
      <Logo src={logoSrc} alt="" />
    </Link>

    <MenuWrapper>
      <Menu>
        <ListItemLink to="/keys" title="Keys" image={require('../resources/keys.svg')} />
        <ListItemLink to="/context" title="Context" image={require('../resources/context.svg')} />
        <ListItemLink
          to="/settings"
          title="Settings"
          image={require('../resources/settings.svg')}
        />
      </Menu>
      <div>
        <UserBar />
      </div>
    </MenuWrapper>
  </HeaderContainer>
);

export default AppHeader;
