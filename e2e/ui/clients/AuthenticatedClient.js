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

const data = {
  name: 'tweek-test',
  email: 'test@tweek.com',
};

async function generateToken() {
  const inlineKey = nconf.get('GIT_PRIVATE_KEY_INLINE');
  const key =
    (inlineKey && new Buffer(inlineKey, 'base64')) ||
    (await readFile(nconf.get('GIT_PRIVATE_KEY_PATH')));

  return await jwtSign(data, key, jwtOptions);
}

async function getAuthenticatedClient(baseURL) {
  const token = await generateToken();
  return axios.create({
    baseURL,
    timeout: 1000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default class AuthenticatedClient {
  constructor(baseUrl) {
    this._clientPromise = getAuthenticatedClient(baseUrl);
  }

  _get(path) {
    return browser.runAsync(async () => {
      let client = await this._clientPromise;
      return client.get(path).then(r => r.data);
    });
  }
}
