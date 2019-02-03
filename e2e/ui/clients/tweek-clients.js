import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { gatewayUrl } from '../utils/constants';
import { credentials } from '../utils/auth-utils';

const options = {
  baseServiceUrl: gatewayUrl,
  clientId: credentials.username,
  clientSecret: credentials.password,
};

export const tweekClient = createTweekClient(options);

export const tweekManagementClient = createTweekManagementClient(options);
