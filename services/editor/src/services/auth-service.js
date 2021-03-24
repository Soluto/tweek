import { getAuthClient, storeProvider } from './clients/auth-client';

let authClient = getAuthClient();

export const setProvider = (provider) => {
  storeProvider(provider);
  authClient = getAuthClient(provider);
  return authClient;
};

export const getClient = () => {
  return authClient;
};
