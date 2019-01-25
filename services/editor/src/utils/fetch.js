/* global fetch window */

export const getGatewayBaseUrl = () => window.GATEWAY_URL || '';

export const toAbsoluteUrl = relativeUrl => `${getGatewayBaseUrl()}${relativeUrl}`;

export default async (relativeUrl, config = {}) => {
  const url = toAbsoluteUrl(relativeUrl);
  const headers = config.headers;
  const mode = 'cors';
  const response = await fetch(url, { ...config, headers, mode });
  if (!response.ok) {
    throw response;
  }
  return response;
};
