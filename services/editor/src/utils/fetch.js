/* global fetch window process */
import { retrieveToken } from '../services/auth-service';

export const getGatewayBaseUrl = () => window.GATEWAY_URL || '';

export const getConfiguration = async (configName) => {
  const token = retrieveToken();
  const userGroupResponse = await unAuthFetch('/api/v2/current-user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!userGroupResponse.ok) {
    throw userGroupResponse;
  }
  const { User } = await userGroupResponse.json();
  const url = `${getGatewayBaseUrl()}/api/v2/values/@tweek/editor/${configName}?tweek_editor_user=${User}`;
  const headers = { Authorization: `Bearer ${token}` };
  const mode = 'cors';
  const response = await fetch(url, { headers, mode });
  if (!response.ok) {
    throw response;
  }
  return response;
};

export const unAuthFetch = async (relativeUrl, config = {}) => {
  const url = `${getGatewayBaseUrl()}${relativeUrl}`;
  const headers = config.headers;
  const mode = 'cors';
  const response = await fetch(url, { ...config, headers, mode });
  if (!response.ok) {
    throw response;
  }
  return response;
};

export const toAbsoluteUrl = relativeUrl => `${getGatewayBaseUrl()}${relativeUrl}`;
