import { AzureAuthClient } from './azure-auth-client';
import { BasicAuthClient } from './basic-auth-client';
import { OidcAuthClient } from './oidc-auth-client';
import storage from './storage';

const PROVIDER_KEY = '@kweek:auth-provider';

export const getStoredProvider = () => {
  const provider = storage.getItem(PROVIDER_KEY);
  if (!provider) {
    return undefined;
  }

  try {
    return JSON.parse(provider);
  } catch (err) {
    console.error('failed to parse stored provider', provider);
    return undefined;
  }
};

export const storeProvider = (provider) => {
  storage.setItem(PROVIDER_KEY, JSON.stringify(provider));
};

export const clearProvider = () => {
  storage.removeItem(PROVIDER_KEY);
};

export const getAuthClient = (provider = getStoredProvider()) => {
  if (!provider) {
    return undefined;
  }

  const type = provider.login_info.login_type;

  switch (type) {
    case 'azure':
      return new AzureAuthClient(provider);
    case 'oidc':
      return new OidcAuthClient(provider);
    case 'basic':
      return new BasicAuthClient(provider);
    default:
      console.warn('unknown provider type', type);
      return undefined;
  }
};
