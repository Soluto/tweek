import nconf from 'nconf';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { promisify } from 'util';
import { expect } from 'chai';

const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: '15m',
};

async function getAuthenticatedClient() {
  const keyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
  const authKey = await readFile(keyPath);
  const token = await jwtSign({}, authKey, jwtOptions);
  return axios.create({
    baseURL: nconf.get('TWEEK_API_URL'),
    timeout: 1000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

const clientPromise = getAuthenticatedClient();

class TweekApiClient {
  _get(path) {
    return browser.runAsync(async () => {
      let client = await clientPromise;
      return client.get(path).then(r => r.data);
    });
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
