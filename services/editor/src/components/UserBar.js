import React from 'react';
import md5 from 'md5';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { CurrentUserContext } from '../contexts/CurrentUser';

const Container = styled.div`
  display: flex;
  background-color: #00506d;
  width: 180px;
  justify-content: flex-end;
  border-left: 1px solid #eee;
  flex-direction: row;
  height: 100%;
  color: white;
  align-items: center;
  padding-right: 10px;
`;

const UserBar = () => (
  <CurrentUserContext.Consumer>
    {(user) =>
      user && (
        <Container>
          <div style={{ marginRight: 16, marginLeft: 16, textAlign: 'right' }}>
            <div style={{ fontWeight: 200 }}>{user.Name || user.User}</div>
            <Link style={{ color: 'white', fontSize: 12 }} to="/logout">
              Logout
            </Link>
          </div>
          <div>
            <img
              alt="avatar"
              src={`https://www.gravatar.com/avatar/${md5(
                user.Email || user.User,
              )}?s=45&d=identicon`}
            />
          </div>
        </Container>
      )
    }
  </CurrentUserContext.Consumer>
);

export default UserBar;
