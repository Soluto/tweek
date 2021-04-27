import { LocationDescriptor } from 'history';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { AuthProvider } from 'tweek-client';
import browserHistory from '../../../store/browserHistory';
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

export abstract class BaseAuthClient {
  readonly tokenKey: string;

  constructor(readonly provider: AuthProvider) {
    this.tokenKey = `@tweek:auth-${provider.login_info.login_type}-token`;
  }

  abstract signIn(state: LocationDescriptor): void;

  abstract processRedirect(): Promise<{ redirect?: LocationDescriptor } | undefined>;

  signOut() {
    storage.removeItem(this.tokenKey);
  }

  async getAuthToken(location = browserHistory.location): Promise<string | undefined | null> {
    const token = await this.retrieveToken();
    if (!token || !isTokenValid(token)) {
      this.signIn(location);
      return undefined;
    }

    return token;
  }

  protected async retrieveToken(): Promise<string | undefined | null> {
    return storage.getItem(this.tokenKey);
  }

  setAuthToken(token: string) {
    storage.setItem(this.tokenKey, token);
  }
}
