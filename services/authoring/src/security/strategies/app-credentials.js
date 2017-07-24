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
      const result = generateHash(secretBuf, salt);
      if (result.toString('hex') === hash) return app;
    }
    throw { messge: 'mismatch client/secret', clientId };
  }

  authenticate(req) {
    const [clientId, clientSecret] = [req.get['x-client-id'], req.get['x-client-secret']];
    if (!clientId || !clientSecret) this.fail();

    const app = appsRepo.get(clientId);
    const keys = app['secret_keys'];
    validateKeys(keys, clientSecret).then(() => this.success(app)).catch(ex => this.fail(ex));
  }
}

module.exports = ExternalAppsCredentialsStrategy;
