/* global fetch console Headers localStorage window process */
import Oidc from 'oidc-client';
import adal from 'adal-angular';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { unAuthFetch } from '../utils/fetch';

const store = {};
let storage;

if (typeof localStorage === 'undefined') {
  storage = {
    setItem: (itemKey, itemValue) => {
      store[itemKey] = itemValue;
    },
    getItem: itemKey => store[itemKey],
    removeItem: itemKey => delete store[itemKey],
  };
} else {
  storage = localStorage;
}

export const storeToken = (token) => {
  storage.setItem('token', token);
};

export const retrieveToken = () => storage.getItem('token');

const storeOidcSettings = (settings) => {
  storage.setItem('oidc-settings', JSON.stringify(settings));
};

const retrieveOidcSettings = () => JSON.parse(storage.getItem('oidc-settings'));

export const isAuthenticated = async () => {
  const token = retrieveToken();
  if (token) {
    const expiration = moment.unix(jwt_decode(token).exp);
    if (moment().isBefore(expiration)) {
      return true;
    }
    const settings = retrieveOidcSettings();
    await getOidcClient(settings)
      .signinSilent()
      .then((user) => {
        storeToken(user.id_token);
      });
    return true;
  }
  return false;
};

let oidcClient;
const getOidcClient = (settings = { ...basicOidcConfig }) =>
  oidcClient ||
  new Oidc.UserManager({
    ...settings,
    userStore: new Oidc.WebStorageStateStore({ store: storage }),
  });

const basicOidcConfig = {
  response_type: 'token id_token',
  filterProtocolClaims: true,
  loadUserInfo: true,
  automaticSilentRenew: true,
  redirect_uri: `${window.location.origin}/auth-result/oidc`,
  silent_redirect_uri: `${window.location.origin}/auth-result/silent`,
  post_logout_redirect_uri: `${window.location.origin}/login`,
  prompt: 'login',
};

export const getAuthProviders = async () => {
  const res = await unAuthFetch(`/auth/providers`);
  if (res.ok) {
    const providers = await res.json();
    return providers;
  }
  return [];
};

export const configureOidc = (authority, client_id, scope) => ({
  ...basicOidcConfig,
  authority,
  userStore: new Oidc.WebStorageStateStore({ store: storage }),
  client_id,
  scope,
});

export const signinRequest = (oidcSettings, state) => {
  const oidcClient = getOidcClient(oidcSettings);
  storeOidcSettings(oidcSettings);
  return oidcClient.signinRedirect(state);
};

export const processSigninRedirectCallback = async () => {
  const oidcClient = getOidcClient();
  oidcClient.events.addSilentRenewError(error => console.log('Error while renew token', error));
  const user = await oidcClient.signinRedirectCallback();
  storeToken(user.id_token);
  return user;
};

export const processSilentSigninCallback = async () => {
  const oidcClient = getOidcClient(retrieveOidcSettings());
  const user = await oidcClient.signinSilentCallback();
  storeToken(user.id_token);
  return user;
};

export const azureSignin = (resource, tenant, clientId, state) => {
  const azureConfig = {
    tenant,
    clientId,
    resource,
    state,
    navigateToLoginRequestUrl: false,
    redirectUri: `${window.location.origin}/auth-result/azure`,
  };
  localStorage.setItem('azureConfig', JSON.stringify(azureConfig));
  const authContext = new adal(azureConfig);
  authContext.login();
};

export const getAzureToken = () => {
  const azureConfig = JSON.parse(localStorage.getItem('azureConfig'));
  const authContext = new adal(azureConfig);
  authContext.handleWindowCallback();
  authContext.acquireToken(azureConfig.resource, (errorDesc, token, error) => {
    if (error) {
      console.error('Authentication failed', errorDesc);
      // should redirect to authentication error page
      return;
    }
    storeToken(token);
  });
};

export const getAzureState = () => JSON.parse(localStorage.getItem('azureConfig')).state;
