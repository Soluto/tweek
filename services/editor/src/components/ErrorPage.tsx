import styled from '@emotion/styled';
import React from 'react';
import { Link } from 'react-router-dom';
import { FetchError } from 'tweek-client';
import logoSrc from './resources/logo.svg';

const getErrorText = (error: unknown) => {
  if (error instanceof Response) {
    return error.statusText;
  }
  if (error instanceof FetchError) {
    return error.response.statusText;
  }
  return 'Unknown Error';
};

const Main = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Header = styled.div`
  height: 70px;
  background-color: #009fda;

  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  margin: 5px 0 0 20px;
  width: 140px;
`;

const Body = styled.div`
  position: absolute;
  top: 70px;
  left: 0px;
  right: 0px;
  bottom: 0px;

  display: flex;
  align-items: center;
`;

const ErrorMessage = styled.div`
  flex: 1;
  text-align: center;

  font-size: 28px;
  font-family: Roboto, sans-serif;
  color: red;
`;

export type ErrorPageProps = {
  error: unknown;
};

const ErrorPage = ({ error }: ErrorPageProps) => (
  <Main>
    <Header>
      <Link to="/" replace>
        <Logo className={'logo'} src={logoSrc} alt={''} />
      </Link>
    </Header>
    <Body>
      <ErrorMessage data-comp="error-message">{getErrorText(error)}</ErrorMessage>
    </Body>
  </Main>
);

export default ErrorPage;
