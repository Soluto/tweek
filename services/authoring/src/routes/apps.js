const uuid = require('uuid');
const { promisify } = require('util');
const crypto = require('crypto');
const { generateHash } = require('../apps/apps-utils');
const randomBytes = promisify(crypto.randomBytes);

async function createSecretKey() {
  const salt = await randomBytes(64);
  const secret = await randomBytes(128);
  const hash = await generateHash(secret, salt);
  const creationDate = new Date();
  return {
    secret: secret.toString('base64'),
    key: {
      salt: salt.toString('hex'),
      hash,
      creationDate,
    },
  };
}

function createNewAppManifest(appName, permissions) {
  return {
    version: '1',
    name: appName,
    secretKeys: [],
    permissions,
  };
}

async function createApp(req, res, { appsRepository, author }) {
  const { name: appName, permissions = [] } = req.body;
  //validate permissions
  const appId = uuid.v4();
  const newApp = createNewAppManifest(appName, permissions);
  const { secret: appSecret, key } = await createSecretKey();
  newApp.secretKeys.push(key);
  await appsRepository.saveApp(appId, newApp, author);

  res.json({
    appId,
    appSecret,
  });
}

module.exports = {
  createApp,
};
