import { LocationDescriptor } from 'history';
import Oidc, { User } from 'oidc-client';
import { AuthProvider } from 'tweek-client';
import { BaseAuthClient, isTokenValid } from './base-auth-client';
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
  readonly client: Oidc.UserManager;

  constructor(provider: AuthProvider) {
    super(provider);

    this.client = new Oidc.UserManager({
      ...basicOidcConfig,
      authority: provider.authority,
      client_id: provider.client_id,
      scope: provider.login_info.scope,
      response_type: provider.login_info.response_type || basicOidcConfig.response_type,
      userStore: new Oidc.WebStorageStateStore({ store: storage }),
    });

    this.client.events.addSilentRenewError((error) =>
      console.log('Error while renew token', error),
    );
  }

  signIn(state: LocationDescriptor) {
    return this.client.signinRedirect({ state });
  }

  signOut() {
    return this.client.revokeAccessToken();
  }

  async processRedirect() {
    const user = await this.client.signinRedirectCallback();
    return user.state;
  }

  processSilentRedirect() {
    return this.client.signinSilentCallback();
  }

  protected async retrieveToken() {
    let user = await this.client.getUser();

    if (!user) {
      return undefined;
    }

    if (!isTokenValid(user.id_token)) {
      const isSilentEnabled = await this.isSilentSigninEnabled(user);
      if (isSilentEnabled) {
        user = await this.client.signinSilent();
      }
    }

    return user?.id_token;
  }

  private async isSilentSigninEnabled(user: User) {
    if (user.refresh_token) {
      return true;
    }

    try {
      return Boolean(await this.client.metadataService.getCheckSessionIframe());
    } catch (err) {
      console.warn('failed to retrieve oidc metadata', err);
      return false;
    }
  }
}
