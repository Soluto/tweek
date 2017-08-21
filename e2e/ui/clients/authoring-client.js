import nconf from 'nconf';
import { expect } from 'chai';
import AuthenticatedClient from './AuthenticatedClient';

class AuthoringClient extends AuthenticatedClient {
  constructor() {
    super(nconf.get('AUTHORING_URL'));
  }

  getKey(key) {
    return this._get(`api/keys/${key}`);
  }

  waitForKeyToBeDeleted(key) {
    const timeout = 5000;
    browser.waitToPass(
      () => expect(() => this.getKey(key), `key still exists after ${timeout}ms`).to.throw(),
      timeout,
    );
  }

  eventuallyExpectKey(key, assertion) {
    browser.waitToPass(() => assertion(this.getKey(key)), 15000);
  }
}

export default new AuthoringClient();
