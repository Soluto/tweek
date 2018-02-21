const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');
const { pollUntil } = require('../../utils/utils');
const { getObjectContentFromMinio } = require('../../utils/minio');

describe.skip('authoring api policy', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  after(async () => {
    const policy = 'p, test@tweek.com, /api/v2/values/*, *';

    await clients.authoring
      .put('/api/policies?author.name=test&author.email=test@soluto.com')
      .send({
        policy,
      })
      .expect(200);

    await pollUntil(
      () => getObjectContentFromMinio('policy.csv'),
      res => expect(res).to.equal(policy),
    );
  });

  it('update policy', async () => {
    const expectedPolicy = 'p, test@soluto.com, /api/v2/values/*, *';

    await clients.authoring
      .put('/api/policies?author.name=test&author.email=test@soluto.com')
      .send({
        policy: expectedPolicy,
      })
      .expect(200);

    await pollUntil(
      () => getObjectContentFromMinio('policy.csv'),
      res => expect(res).to.equal(expectedPolicy),
    );
  });
});
