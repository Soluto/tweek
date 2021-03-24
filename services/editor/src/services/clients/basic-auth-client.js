import { BaseAuthClient } from './base-auth-client';

export class BasicAuthClient extends BaseAuthClient {
  processRedirect(token) {
    this.setAuthToken(token);
  }
}
