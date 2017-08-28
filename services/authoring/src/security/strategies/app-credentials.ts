import { Strategy } from 'passport-strategy';
import { generateHash } from '../../apps/apps-utils';
import crypto = require('crypto');

class ExternalAppsCredentialsStrategy extends Strategy {
  name: string;

  constructor(private _appsRepo) {
    super();
    this.name = 'apps-credentials';
  }

  async validateKeys(keys, clientSecret, clientId) {
    const secretBuf = Buffer.from(clientSecret, 'base64');
    for (const { salt, hash } of keys) {
      const saltBuf = Buffer.from(salt, 'hex');
      const resultBuf = await generateHash(secretBuf, saltBuf);
      const hashBuf = Buffer.from(hash, 'hex');
      if (crypto.timingSafeEqual(resultBuf, hashBuf)) return;
    }
    throw { messge: 'mismatch client/secret', clientId };
  }

  authenticate(req) {
    const clientId = req.get('x-client-id');
    const clientSecret = req.get('x-client-secret');
    if (!clientId || !clientSecret) {
      return this.fail(401);
    }
    const app = this._appsRepo.getApp(clientId);
    if (!app) {
      return this.fail('no matching app', 401);
    }
    const keys = app['secretKeys'];
    this.validateKeys(keys, clientSecret, clientId).then(() => this.success(app, undefined)).catch(ex => this.error(ex));
  }
}

export default ExternalAppsCredentialsStrategy;
