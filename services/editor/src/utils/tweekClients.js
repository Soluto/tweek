/* global window */
import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { TweekRepository } from 'tweek-local-cache';
import { retrieveToken } from '../services/auth-service';

export const getGatewayBaseUrl = () => window.GATEWAY_URL || '';

export const toAbsoluteUrl = relativeUrl => `${getGatewayBaseUrl()}${relativeUrl}`;

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: retrieveToken,
  clientName: 'tweek-editor',
};

export const tweekManagementClient = createTweekManagementClient(config);

export const tweekClient = createTweekClient(config);

export const tweekRepository = new TweekRepository({ client: tweekClient });
