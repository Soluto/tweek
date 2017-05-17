import nconf from 'nconf';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {promisify} from 'bluebird';

const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: "15m"
};

async function getAuthenticatedClient() {
  const keyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
  const authKey = await readFile(keyPath);
  const token = await jwtSign({}, authKey, jwtOptions);
  return axios.create({
    baseURL: nconf.get('TWEEK_API_URL'),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default getAuthenticatedClient();
