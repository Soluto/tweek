import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { retrieveToken } from '../services/auth-service';
import { getGatewayBaseUrl } from './fetch';

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: retrieveToken,
  clientName: 'tweek-editor',
};

export const tweekManagementClient = createTweekManagementClient(config);

export const tweekClient = createTweekClient(config);
