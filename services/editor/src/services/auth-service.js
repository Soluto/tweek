/* global fetch console Headers localStorage window */
import Oidc from 'oidc-client';

export const getAuthProviders = async () => {
  const res = await fetch('http://localhost:4099/auth/providers', {
    method: 'GET',
    headers: new Headers({
      'content-type': 'application/json',
    }),
    mode: 'cors',
  });
  if (res.ok) {
    const providers = await res.json();
    return providers;
  }
  return [];
};

export const configureOidc = (id, authority, client_id) => ({
  authority,
  client_id,
  redirect_uri: `${window.location.origin}/auth/${id}/`,
  silent_redirect_uri: `${window.location.origin}/auth/${id}/`,
  post_logout_redirect_uri: `${window.location.origin}/login`,
  response_type: 'id_token token',
  filterProtocolClaims: true,
  loadUserInfo: true,
});

export const signinRequest = (oidcSettings, state) => {
  localStorage.setItem('oidcSettings', JSON.stringify(oidcSettings));
  const oidcClient = new Oidc.UserManager(oidcSettings);
  return oidcClient.signinRedirect(state);
};

export const processSigninRedirectCallback = async () => {
  const oidcSettings = JSON.parse(localStorage.getItem('oidcSettings'));
  const oidcClient = new Oidc.UserManager(oidcSettings);
  const user = await oidcClient.signinRedirectCallback();
  console.log('USER', user);
};
