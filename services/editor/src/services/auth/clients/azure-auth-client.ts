import adal from 'adal-angular';
import { LocationDescriptor } from 'history';
import { AuthProvider } from 'tweek-client';
import { BaseAuthClient, isTokenValid } from './base-auth-client';
import storage from './storage';

const STATE_KEY = '@tweek:azure-state';

export class AzureAuthClient extends BaseAuthClient {
  readonly config: adal.Options & { resource: string };

  constructor(provider: AuthProvider) {
    super(provider);

    const { resource, tenant } = provider.login_info.additional_info as {
      resource: string;
      tenant: string;
    };

    this.config = {
      tenant,
      resource,
      clientId: provider.client_id,
      navigateToLoginRequestUrl: false,
      redirectUri: `${window.location.origin}/auth-result/azure`,
    };
  }

  signIn(state: LocationDescriptor) {
    storage.setItem(STATE_KEY, JSON.stringify(state));
    const context = new adal(this.config);
    return context.login();
  }

  async processRedirect() {
    const authContext = new adal(this.config);

    authContext.handleWindowCallback();

    const token = await new Promise<string>((resolve, reject) =>
      authContext.acquireToken(this.config.resource, (errorDesc, token, error) => {
        if (error || !token) {
          console.error('Authentication failed', errorDesc);
          reject(error);
          return;
        }

        if (!isTokenValid(token)) {
          reject(new Error('Expiration time is in the past'));
          return;
        }

        resolve(token);
      }),
    );

    this.setAuthToken(token);

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
