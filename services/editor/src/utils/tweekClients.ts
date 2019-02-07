/* global window */
import { createTweekClient, createTweekManagementClient } from 'tweek-client';
import { retrieveToken } from '../services/auth-service';

declare const window:any;

export const getGatewayBaseUrl = () => window.GATEWAY_URL || '';

const config = {
  baseServiceUrl: getGatewayBaseUrl(),
  getAuthenticationToken: retrieveToken,
};

export const tweekManagementClient = createTweekManagementClient(config);

export const tweekClient = createTweekClient(config);
