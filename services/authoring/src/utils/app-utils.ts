import { v4 as uuidV4 } from 'uuid';
import crypto = require('crypto');
import { promisify } from 'util';
import { AppManifest } from '../repositories/apps-repository';

const pbkdf2 = promisify(crypto.pbkdf2);

export async function generateHash(secret, salt) {
  return await pbkdf2(secret, salt, 100, 512, 'sha512');
}

const randomBytes = promisify(crypto.randomBytes);

export async function createSecretKey() {
  const id = uuidV4();
  const salt = await randomBytes(64);
  const secret = await randomBytes(128);
  const hash = await generateHash(secret, salt);
  const creationDate = new Date();
  return {
    secret: secret.toString('base64'),
    key: {
      id,
      salt: salt.toString('hex'),
      hash: hash.toString('hex'),
      creationDate,
    },
  };
}

export function createNewAppManifest(appName, permissions): AppManifest {
  return {
    version: '1',
    name: appName,
    secretKeys: [],
    permissions,
  };
}
