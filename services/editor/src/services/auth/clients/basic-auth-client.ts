import { getGatewayBaseUrl } from '../../../utils';
import { BaseAuthClient, RedirectState } from './base-auth-client';

export class BasicAuthClient extends BaseAuthClient {
  signIn(state?: RedirectState) {
    window.location.href = `${getGatewayBaseUrl()}/auth/basic?redirect_url=${
      window.location.origin
    }/auth-result/basic&state=${JSON.stringify(state)}`;
  }

  async processRedirect() {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get('jwt');
    if (!jwt) {
      throw new Error('Auth token not found');
    }

    this.setAuthToken(jwt);

    const state = params.get('state');

    try {
      return JSON.parse(state!) as RedirectState;
    } catch {
      return undefined;
    }
  }
}
