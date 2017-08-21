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

async function generateToken() {
  const keyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
  const authKey = await readFile(keyPath);
  return await jwtSign({}, authKey, jwtOptions);
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
