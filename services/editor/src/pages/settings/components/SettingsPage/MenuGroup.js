import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const MenuGroupContainer = styled.li`
  margin: 0;
`;

const GroupTitle = styled.div`
  padding: 10px;
  background-color: #333b41;
`;

const GroupList = styled.ul`
  display: flex;
  padding-left: 20px;
  flex-direction: column;
`;

export const MenuItem = styled.li`
  flex-direction: column;
  background: #414b53;
  margin: 6px 0;
  display: flex;
`;

const MenuLink = styled(Link)`
  font-size: 16px;
  color: #d8d8d8;
  text-decoration: none;
`;

export const MenuLinkItem = (props) => (
  <MenuItem>
    <MenuLink {...props} />
  </MenuItem>
);

export const MenuGroup = ({ name, children }) => (
  <MenuGroupContainer>
    <GroupTitle data-comp="group">{name}</GroupTitle>
    <GroupList>{children}</GroupList>
  </MenuGroupContainer>
);
