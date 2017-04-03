import jwt from 'jsonwebtoken';
import nconf from 'nconf';
import fs from 'fs';

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: "5m"
};

function getAuthKey() {
  return new Promise(function (resolve, reject) {
    const keyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
    if (!keyPath) reject('private key not found');

    fs.readFile(keyPath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function getSignedToken(authKey) {
  return new Promise(function (resolve, reject) {
    jwt.sign({}, authKey, jwtOptions, function(err, token) {
      if (err) reject(err);
      else resolve(token);
    });
  })
}

let authKeyPromise;

export default async function generateToken() {
  authKeyPromise = authKeyPromise || getAuthKey();
  const authKey = await authKeyPromise;
  if (!authKey) return undefined;
  return await getSignedToken(authKey);
}
