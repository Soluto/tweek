import styled from '@emotion/styled';
import React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';

const ListItem = styled.li`
  list-style: none;
`;

const MenuItem = styled(Link)`
  display: flex;
  border-bottom: 4px solid ${({ active }) => (active ? 'white' : 'transparent')};
  padding: 0 10px;
  color: white;
  height: calc(100% - 4px);
  cursor: pointer;

  flex-grow: 1;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  font-size: 22px;
  font-weight: 300;

  transition: all 0.2s ease-in-out;

  &:hover,
  &:active {
    border-bottom-color: white;
  }
`;

const Title = styled.span`
  margin-right: 24px;
`;

const ListItemLink = ({ to, title, image }) => (
  <Route
    path={to}
    children={({ match }) => (
      <ListItem>
        <MenuItem active={match} to={to}>
          <img src={image} alt="" />
          <Title>{title}</Title>
        </MenuItem>
      </ListItem>
    )}
  />
);

export default ListItemLink;
