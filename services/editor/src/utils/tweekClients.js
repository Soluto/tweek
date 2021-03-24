/* global window */
import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { getClient } from '../services/auth-service';

export const getGatewayBaseUrl = () => window.GATEWAY_URL || '';

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: () => {
    const client = getClient();
    return client && client.getAuthToken();
  },
};

export const tweekManagementClient = createTweekManagementClient({
  ...config,
  requestTimeoutInMillis: 60 * 1000,
});

export const tweekClient = createTweekClient(config);
