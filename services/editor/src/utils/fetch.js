/* global fetch process */
import { retrieveIdToken } from '../services/auth-service';

export default async function (relativeUrl, config = {}) {
  const url = `${process.env.REACT_APP_GATEWAY_URL}/api/v2${relativeUrl}`;
  const id_token = retrieveIdToken();
  const originHeaders = config.headers;
  const headers = id_token
    ? { ...originHeaders, Authorization: `Bearer ${id_token}` }
    : originHeaders;
  const mode = 'cors';
  const response = await fetch(url, { ...config, headers, mode });
  if (!response.ok) {
    throw response;
  }
  return response;
}

export const unAuthFetch = async (relativeUrl, config = {}) => {
  const url = `${process.env.REACT_APP_GATEWAY_URL}${relativeUrl}`;
  const headers = config.headers;
  const mode = 'cors';
  const response = await fetch(url, { ...config, headers, mode });
  if (!response.ok) {
    throw response;
  }
  return response;
};

export const toAbsoluteUrl = relativeUrl => `${process.env.REACT_APP_GATEWAY_URL}${relativeUrl}`;
