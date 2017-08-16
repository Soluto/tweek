import crypto = require('crypto');
import { promisify } from 'util';

const pbkdf2 = promisify(crypto.pbkdf2);

export async function generateHash(secret, salt) {
  return await pbkdf2(secret, salt, 100, 512, 'sha512');
}
