import { LocationDescriptor } from 'history';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { AuthProvider } from 'tweek-client';
import storage from './storage';

export const isTokenValid = (token: string) => {
  try {
    const decoded = jwt_decode<{ exp: number }>(token);
    const expiration = moment.unix(decoded.exp);
    return moment().isBefore(expiration);
  } catch (err) {
    console.error('failed to decode token', err);
  }
};

export type RedirectState = { redirect?: LocationDescriptor };

export abstract class BaseAuthClient {
  readonly tokenKey: string;

  constructor(readonly provider: AuthProvider) {
    this.tokenKey = `@tweek:auth-${provider.login_info.login_type}-token`;
  }

  abstract signIn(state?: RedirectState): void;

  abstract processRedirect(): Promise<RedirectState | undefined>;

  signOut() {
    this.removeToken();
  }

  async getAuthToken(state?: RedirectState): Promise<string | undefined> {
    const token = await this.retrieveToken();

    if (!token || !isTokenValid(token)) {
      this.removeToken();
      if (state) {
        this.signIn(state);
      }
      return undefined;
    }

    return token;
  }

  protected async retrieveToken(): Promise<string | undefined | null> {
    return storage.getItem(this.tokenKey);
  }

  protected setAuthToken(token: string) {
    storage.setItem(this.tokenKey, token);
  }

  protected removeToken() {
    storage.removeItem(this.tokenKey);
  }
}
