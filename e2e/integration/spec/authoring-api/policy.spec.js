const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');
const { pollUntil } = require('../../utils/utils');
const { getObjectContentFromMinio } = require('../../utils/minio');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

describe('authoring api policy', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('update policy', async () => {
    const buf = await readFileAsync('./spec/authoring-api/test-data/policy.csv');

    const originalPolicy = buf.toString();
    const newPolicy =
      'p, test@soluto.com, /api/v2/values/*, *, allow\np, test@tweek.com, /api/v2/values/*, *, allow';

    await pollUntil(
      () => getObjectContentFromMinio('policy.csv'),
      res => expect(res).to.equal(originalPolicy),
    );

    await clients.authoring
      .put('/api/policies?author.name=test&author.email=test@soluto.com')
      .send({
        policy: newPolicy,
      })
      .expect(200);

    await pollUntil(
      () => getObjectContentFromMinio('policy.csv'),
      res => expect(res).to.equal(newPolicy),
    );
  });
});
