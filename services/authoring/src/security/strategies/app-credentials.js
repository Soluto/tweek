const Strategy = require('passport-strategy');
const { generateHash } = require('../../apps/apps-utils');

class ExternalAppsCredentialsStrategy extends Strategy {
  constructor(appsRepo) {
    super();
    this._appsRepo = appsRepo;
    this.name = 'apps-credentials';
  }

  async validateKeys(keys, clientSecret) {
    const secretBuf = Buffer.from(clientSecret, 'base64');
    for (const { salt, hash } of keys) {
      const saltBuf = Buffer.from(salt, 'hex');
      const result = await generateHash(secretBuf, saltBuf);
      if (result === hash) return;
    }
    throw { messge: 'mismatch client/secret', clientId };
  }

  authenticate(req) {
    const clientId = req.get('x-client-id');
    const clientSecret = req.get('x-client-secret');
    if (!clientId || !clientSecret) {
      return this.fail();
    }
    const app = this._appsRepo.getApp(clientId);
    if (!app) {
      return this.fail('no matching app');
    }
    const keys = app['secretKeys'];
    this.validateKeys(keys, clientSecret).then(() => this.success(app)).catch(ex => this.error(ex));
  }
}

module.exports = ExternalAppsCredentialsStrategy;
