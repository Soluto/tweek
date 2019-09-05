/* global window process */
import React from 'react';
import styled from '@emotion/styled';
import { getGatewayBaseUrl } from '../../../utils/tweekClients';

const Button = styled.a`
  padding-top: 14px;
  padding-bottom: 17px;
  margin: 15px;
  width: 40%;
  background-color: #00aeef;
  border-radius: 25px;

  color: #ffffff;
  font-family: Roboto;
  font-size: 14.4px;
  font-weight: bold;

  text-align: center;
  text-decoration: none;
`;

const buildAuthUrl = (state) =>
  `${getGatewayBaseUrl()}/auth/basic?redirect_url=${
    window.location.origin
  }/auth-result/basic&state=${JSON.stringify(state)}`;

const BasicAuthLoginButton = ({ state }) => (
  <Button data-comp="Basic Auth Login" href={buildAuthUrl(state)}>
    Basic Auth Login
  </Button>
);

export default BasicAuthLoginButton;
