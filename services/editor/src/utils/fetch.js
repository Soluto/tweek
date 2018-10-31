/* global fetch window process */
import { retrieveToken } from '../services/auth-service';

export const getGatewayBaseUrl = () => window.GATEWAY_URL || '';

export default async function (relativeUrl, config = {}) {
  const url = `${getGatewayBaseUrl()}/api/v2${relativeUrl}`;
  const token = retrieveToken();
  const originHeaders = config.headers;
  const headers = token ? { ...originHeaders, Authorization: `Bearer ${token}` } : originHeaders;
  const mode = 'cors';
  const response = await fetch(url, { ...config, headers, mode });
  if (!response.ok) {
    throw response;
  }
  return response;
}

export const getConfiguration = async (configName) => {
  const { User, Group } = await unAuthFetch('/api/v2/current-user').json();
  const editorUser = `${Group}:${User}`;
  const url = `${getGatewayBaseUrl()}/api/v2/values/@tweek/editor/${configName}?tweek_editor_user=${editorUser}`;
  const token = retrieveToken();
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
