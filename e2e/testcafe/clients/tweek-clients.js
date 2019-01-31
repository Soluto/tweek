import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import fetch from 'node-fetch';
import { gatewayUrl } from '../utils/constants';
import { credentials } from '../utils/auth-utils';

const options = {
  baseServiceUrl: gatewayUrl,
  fetch: (url, input = {}) =>
    fetch(url, {
      ...input,
      headers: {
        ...input.headers,
        'X-Client-Id': credentials.username,
        'X-Client-Secret': credentials.password,
      },
    }),
};

export const tweekClient = createTweekClient(options);

export const tweekManagementClient = createTweekManagementClient(options);
