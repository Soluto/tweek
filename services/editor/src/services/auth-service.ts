import { LocationDescriptor } from 'history';
import { AuthProvider } from 'tweek-client';
import { clearProvider, getAuthClient, storeProvider } from './auth/clients/auth-client';

let authClient = getAuthClient();

export const signIn = (provider: AuthProvider, state: LocationDescriptor) => {
  storeProvider(provider);

  authClient = getAuthClient(provider);
  return authClient!.signIn(state);
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

export const basicAuthProvider = {
  name: 'Basic Auth Login',
  login_info: {
    login_type: 'basic',
  },
} as AuthProvider;
