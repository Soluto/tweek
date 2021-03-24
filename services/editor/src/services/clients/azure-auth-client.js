import adal from 'adal-angular';
import { BaseAuthClient, isTokenValid } from './base-auth-client';
import storage from './storage';

const STATE_KEY = '@tweek:azure-state';

export class AzureAuthClient extends BaseAuthClient {
  constructor(provider) {
    super(provider);

    const { resource, tenant } = provider.login_info.additional_info;

    this.client = new adal({
      tenant,
      clientId: provider.client_id,
      resource,
      navigateToLoginRequestUrl: false,
      redirectUri: `${window.location.origin}/auth-result/azure`,
    });
  }

  signIn(state) {
    storage.setItem(STATE_KEY, JSON.stringify(state));
    const context = new adal({ ...this.config, state });
    return context.login();
  }

  processRedirect() {
    const authContext = new adal(this.config);
    authContext.handleWindowCallback();
    authContext.acquireToken(this.config.resource, (errorDesc, token, error) => {
      if (error) {
        console.error('Authentication failed', errorDesc);
        // should redirect to authentication error page
        return;
      }

      if (!isTokenValid(token)) {
        throw new Error('Expiration time is in the past');
      }

      this.setAuthToken(token);
    });

    const state = storage.getItem(STATE_KEY);
    if (!state) {
      return undefined;
    }
    try {
      return JSON.parse(state);
    } catch (err) {
      console.warn('failed to parse azure state', err);
      return undefined;
    }
  }
}
