const uuid = require('uuid');
const { promisify } = require('util');
const crypto = require('crypto');
const { generateHash } = require('../apps/apps-utils');

const randomBytes = promisify(crypto.randomBytes);

async function createSecretKey() {
  const salt = await crypto.randomBytes(64).toString('hex');
  const secret = await crypto.randomBytes(128);
  const hash = await generateHash(secret, salt);
  const creationDate = new Date();
  return {
    secret,
    key: {
      salt,
      hash,
      creationsate,
    },
  };
}

async function createNewAppManifest(appName, permissions) {
  return {
    version: '1',
    name: appName,
    secretKeys: [],
    permissions,
  };
}

async function createApp(req, res) {
  const { name, permissions = [] } = req.body;
  //validate permissions
  const appId = uuid.v4();
  const newApp = createNewAppManifest(appName, permissions);
  const { secret: appSecret, key } = createSecretKey();
  newApp.secretKeys.push(key);
  return {
    appId,
    appSecret,
  };
}

module.exports = {
  createApp,
};
