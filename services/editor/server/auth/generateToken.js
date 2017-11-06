import fs from 'fs';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import nconf from 'nconf';

const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: '5m',
};

async function getAuthKey() {
  const keyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
  if (keyPath && fs.existsSync(keyPath)) {
    return await readFile(keyPath);
  }
  throw 'private key not found';
}

let authKeyPromise;

export default async function generateToken() {
  authKeyPromise = authKeyPromise || getAuthKey();
  try {
    const authKey = await authKeyPromise;
    if (!authKey) return undefined;
    return await jwtSign({}, authKey, jwtOptions);
  } catch (err) {
    console.error('failed to generate token', err);
  }
}
