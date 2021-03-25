import { clearProvider, getAuthClient, storeProvider } from './clients/auth-client';

let authClient = getAuthClient();

export const signIn = (provider, state) => {
  storeProvider(provider);

  authClient = getAuthClient(provider);
  return authClient.signIn(state);
};

export const signOut = () => {
  clearProvider();

  if (authClient) {
    authClient.signOut();
    authClient = undefined;
  }
};

export const getClient = () => {
  return authClient;
};
