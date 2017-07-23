const Strategy = require('passport-strategy');

class ExternalAppsCerdentials extends Strategy {
  constructor(appsRepo) {
    super();
    this._appsRepo = appsRepo;
  }

  async validateKeys(keys, clientSecret) {
    for (const { salt, hash } of keys) {
      const result = await pbkdf2(clientSecret, salt, 10000, 512, 'sha512');
      if (result.toString('hex') === hash) return app;
    }
    throw { messge: 'mismatch client/secret', clientId };
  }

  authenticate(req) {
    const [clientId, clientSecret] = [req.get['x-client-id'], req.get['x-client-secret']];
    if (!clientId || !clientSecret) this.fail();

    const app = appsRepo.get[clientId];
    const keys = app['secret_keys'];
    validateKeys(keys, clientSecret).then(() => this.success(app)).catch(ex => this.fail(ex));
  }
}
