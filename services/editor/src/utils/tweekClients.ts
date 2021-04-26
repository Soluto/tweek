import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { retrieveToken } from '../services/auth-service';

export const getGatewayBaseUrl = (): string => (window as any).GATEWAY_URL || '';

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: retrieveToken,
};

export const tweekManagementClient = createTweekManagementClient({
  ...config,
  requestTimeoutInMillis: 60 * 1000,
});

export const tweekClient = createTweekClient(config);
