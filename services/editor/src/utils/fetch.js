/* global fetch window process */
import { retrieveToken } from '../services/auth-service';

export default async function (relativeUrl, config = {}) {
  const url = `${process.env.REACT_APP_GATEWAY_URL ||
    window.REACT_APP_GATEWAY_URL}/api/v2${relativeUrl}`;
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
  const url = `${process.env.REACT_APP_GATEWAY_URL || window.REACT_APP_GATEWAY_URL}${relativeUrl}`;
  const headers = config.headers;
  const mode = 'cors';
  const response = await fetch(url, { ...config, headers, mode });
  if (!response.ok) {
    throw response;
  }
  return response;
};

export const toAbsoluteUrl = relativeUrl =>
  `${process.env.REACT_APP_GATEWAY_URL || window.REACT_APP_GATEWAY_URL}${relativeUrl}`;
