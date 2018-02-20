const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');
const { getObjectContentFromMinio } = require('../../utils/minio');

describe('authoring api policy', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('update policy', async () => {
    const expectedPolicy = 'p, test@soluto.com, /api/v2/values/*, *';

    await clients.authoring
      .put('/api/policies?author.name=test&author.email=test@soluto.com')
      .send({ policy: expectedPolicy })
      .expect(200);

    await new Promise(resolve => setTimeout(() => resolve(), 1000));

    const gotPolicy = await getObjectContentFromMinio('policy.csv');

    expect(gotPolicy).to.equal(expectedPolicy);
  });
});
