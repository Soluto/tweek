import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { getClient } from '../services/auth-service';

export const getGatewayBaseUrl = (): string => (window as any).GATEWAY_URL || '';

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: async (): Promise<string> => {
    const client = getClient();
    const token = await client?.getAuthToken();
    return token || '';
  },
};

export const tweekManagementClient = createTweekManagementClient({
  ...config,
  requestTimeoutInMillis: 60 * 1000,
});

export const tweekClient = createTweekClient(config);
