import jwt_decode from 'jwt-decode';
import moment from 'moment';
import storage from './storage';

export const isTokenValid = (token) => {
  try {
    const decoded = jwt_decode(token);
    const expiration = moment.unix(decoded.exp);
    return moment().isBefore(expiration);
  } catch (err) {
    console.error('failed to decode token', err);
  }
};

export class BaseAuthClient {
  constructor(provider) {
    this.provider = provider;
    this.tokenKey = `@tweek:auth-${provider.login_info.login_type}-token`;
  }

  signOut() {
    storage.removeItem(this.tokenKey);
  }

  getAuthToken() {
    return storage.getItem(this.tokenKey);
  }

  setAuthToken(token) {
    storage.setItem(this.tokenKey, token);
  }

  async isAuthenticated() {
    const token = await this.getAuthToken();
    if (!token) {
      return false;
    }
    return isTokenValid(token);
  }
}
