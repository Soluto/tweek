import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { TweekRepository } from 'tweek-local-cache';
import { retrieveToken } from '../services/auth-service';
import { getGatewayBaseUrl } from './fetch';

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: retrieveToken,
  clientName: 'tweek-editor',
};

export const tweekManagementClient = createTweekManagementClient(config);

export const tweekClient = createTweekClient(config);

export const tweekRepository = new TweekRepository({ client: tweekClient });
