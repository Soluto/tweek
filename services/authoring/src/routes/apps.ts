import uuid = require('uuid');
import { promisify } from 'util';
import crypto = require('crypto');
import { generateHash } from '../apps/apps-utils';
const randomBytes = promisify(crypto.randomBytes);
import PERMISSIONS from '../security/permissions/consts';
import R = require('ramda');

async function createSecretKey() {
  const salt = await randomBytes(64);
  const secret = await randomBytes(128);
  const hash = await generateHash(secret, salt);
  const creationDate = new Date();
  return {
    secret: secret.toString('base64'),
    key: {
      salt: salt.toString('hex'),
      hash: hash.toString('hex'),
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

const allowedPermissions = R.without(<any>PERMISSIONS.ADMIN, R.values(PERMISSIONS));

const hasValidPermissions = R.all(<any>R.contains((<any>R).__, allowedPermissions));

async function createApp(req, res, { appsRepository, author }) {
  const { name: appName, permissions = [] } = req.body;
  //validate permissions
  const appId = uuid.v4();
  const newApp = createNewAppManifest(appName, permissions);
  if (!hasValidPermissions(permissions)) {
    res.status(400).send(`Invalid permissions: ${R.difference(permissions, allowedPermissions)}`);
    return;
  }
  const { secret: appSecret, key } = await createSecretKey();
  newApp.secretKeys.push(key);
  await appsRepository.saveApp(appId, newApp, author);

  res.json({
    appId,
    appSecret,
  });
}

export default {
  createApp,
};
