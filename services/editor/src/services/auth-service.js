/* global console Headers localStorage window process location */
import Oidc from 'oidc-client';
import adal from 'adal-angular';
import jwt_decode from 'jwt-decode';
import moment from 'moment';

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

export const signOut = () => storage.removeItem('token');

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
    if (isAzure()) {
      return false;
    }
    const settings = retrieveOidcSettings();
    const oidcClient = getOidcClient(settings);
    try {
      const user = await oidcClient.signinSilent();
      storeToken(user.id_token);
    } catch (error) {
      console.error('Encountered error during silent signin', error);
      signinRequest(settings, { state: { redirect: { pathname: window.location.pathname } } });
    }
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
  setAzureConfig(azureConfig);
  const authContext = new adal(azureConfig);
  authContext.login();
};

export const getAzureToken = () => {
  const azureConfig = getAzureConfig();
  const authContext = new adal(azureConfig);
  authContext.handleWindowCallback();
  authContext.acquireToken(azureConfig.resource, (errorDesc, token, error) => {
    if (error) {
      console.error('Authentication failed', errorDesc);
      // should redirect to authentication error page
      return;
    }
    const expiration = moment.unix(jwt_decode(token).exp);
    if (moment().isAfter(expiration)) {
      throw new Error('Expiration time is in the past');
    }
    storeToken(token);
  });
};

export const getAzureState = () => {
  const config = getAzureConfig();
  return config.state;
};
const getAzureConfig = () => JSON.parse(storage.getItem('azureConfig'));
const setAzureConfig = config => storage.setItem('azureConfig', JSON.stringify(config));
const isAzure = () => storage.getItem('azureConfig') !== null;
