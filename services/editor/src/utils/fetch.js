/* global fetch window process */
import { retrieveToken } from '../services/auth-service';

export const getGatewayBaseUrl = () => process.env.REACT_APP_GATEWAY_URL || window.GATEWAY_URL;

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
