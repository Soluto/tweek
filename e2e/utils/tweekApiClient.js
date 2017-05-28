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

var clientPromise =  (async function getAuthenticatedClient() {
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

    waitForKeyToEqual(key, target, timeout = 5000){
        let start = new Date();
        let value;
        while (new Date() - start < timeout){
            value = this.get(key);
            try{
              assert.deepEqual(value, target);
            } catch (ex){
              continue;
            }
        }
        assert.deepEqual(value, target);
    }

}




export default new TweekApiClient();
