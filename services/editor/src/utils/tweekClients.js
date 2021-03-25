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
  fetch: (info, init) => {
    const client = getClient();
    const provider = client && client.provider.id;
    console.log('provider', provider);

    if (init) {
      const headers = new Headers(init.headers);
      headers.append('X-Auth-Provider', provider);
      init.headers = headers;
    } else if (typeof info === 'string') {
      init = { headers: { 'X-Auth-Provider': provider } };
    } else {
      info.headers.append('X-Auth-Provider', provider);
    }

    return fetch(info, init);
  },
};

export const tweekManagementClient = createTweekManagementClient({
  ...config,
  requestTimeoutInMillis: 60 * 1000,
});

export const tweekClient = createTweekClient(config);
