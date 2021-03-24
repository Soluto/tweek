import Oidc from 'oidc-client';
import { BaseAuthClient } from './base-auth-client';
import storage from './storage';

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

export class OidcAuthClient extends BaseAuthClient {
  constructor(provider) {
    super(provider);

    this.client = new Oidc.UserManager({
      ...basicOidcConfig,
      authority: provider.authority,
      client_id: provider.client_id,
      scope: provider.login_info.scope,
      userStore: new Oidc.WebStorageStateStore({ store: storage }),
    });

    this.client.events.addSilentRenewError((error) =>
      console.log('Error while renew token', error),
    );
  }

  signIn(state) {
    return this.client.signinRedirect(state);
  }

  signOut() {
    return this.client.revokeAccessToken();
  }

  async isAuthenticated() {
    const authenticated = super.isAuthenticated();
    if (authenticated) {
      return true;
    }

    try {
      await this.client.signinSilent();
      return true;
    } catch (err) {
      await this.signIn();
      return false;
    }
  }

  async getAuthToken() {
    const user = await this.client.getUser();
    return user && user.id_token;
  }

  processRedirect() {
    return this.client.signinRedirectCallback();
  }

  processSilentRedirect() {
    return this.client.signinSilentCallback();
  }
}
