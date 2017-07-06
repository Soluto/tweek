import nconf from 'nconf';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {promisify} from 'bluebird';
import assert from 'assert';

const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: "15m"
};

const clientPromise =  (async function getAuthenticatedClient() {
  const keyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
  const authKey = await readFile(keyPath);
  const token = await jwtSign({}, authKey, jwtOptions);
  return axios.create({
    baseURL: nconf.get('TWEEK_API_URL'),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
})();

class TweekApiClient{
    _get(path){
      return browser.runAsync(async ()=>{
          let client = await clientPromise;
          return client.get(path).then(r=>r.data)
        });
    }

    get(key){
      return this._get(`api/v1/keys/${key}`);
    }
    
    getContext(identityType, identityName){
      return this._get(`api/v1/context/${identityType}/${identityName}`);
    }

    waitForKeyToEqual(key, target, timeout = 10000) {
      let value = undefined;
      browser.waitUntil(() => {
        value = this.get(key);
        try {
          assert.deepEqual(value, target);
          return true;
        } catch (ex) {
          return false;
        }
      }, timeout);
      assert.deepEqual(value, target);
    }
}

export default new TweekApiClient();
