const jwt = require('jsonwebtoken');
const nconf = require('nconf');
const fs = require('fs');
const promisify = require('bluebird').promisify;

const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: '5m',
};

function getAuthKey() {
  const keyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
  if (!keyPath || !fs.existsSync(keyPath)) {
    throw 'private key not found';
  }
  return readFile(keyPath);
}

var authKeyPromise;

module.exports = function generateToken() {
  authKeyPromise = authKeyPromise || getAuthKey();
  return authKeyPromise.then(authKey => jwtSign({}, authKey, jwtOptions));
};
