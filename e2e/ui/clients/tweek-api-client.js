import nconf from 'nconf';
import { expect } from 'chai';
import AuthenticatedClient from './AuthenticatedClient';

class TweekApiClient extends AuthenticatedClient {
  constructor() {
    super(nconf.get('TWEEK_API_URL'));
  }

  get(key) {
    return this._get(`api/v1/keys/${key}`);
  }

  getContext(identityType, identityId) {
    return this._get(`api/v1/context/${identityType}/${identityId}`);
  }

  waitForKeyToEqual(key, value) {
    this.eventuallyExpectKey(key, result => expect(result).to.deep.equal(value));
  }

  eventuallyExpectKey(key, assertion) {
    browser.waitToPass(() => assertion(this.get(key)), 15000);
  }
}

export default new TweekApiClient();
