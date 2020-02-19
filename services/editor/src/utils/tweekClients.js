/* global window */
import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { retrieveToken } from '../services/auth-service';

export const getGatewayBaseUrl = () => process.env.REACT_APP_GATEWAY_URL || '';

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: retrieveToken,
};

export const tweekManagementClient = createTweekManagementClient({
  ...config,
  requestTimeoutInMillis: 60 * 1000,
});

export const tweekClient = createTweekClient(config);
