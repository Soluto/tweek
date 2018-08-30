const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');
const { pollUntil } = require('../../utils/utils');
const { getObjectContentFromMinio } = require('../../utils/minio');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const jsonpatch = require('fast-json-patch');

describe.skip('authoring api policy', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('get policy', async () => {
    const buf = await readFileAsync('./spec/authoring-api/test-data/policy.json');
    const originalPolicy = JSON.parse(buf.toString());

    await clients.authoring.get('/api/policies').expect(200, originalPolicy);
  });

  it('replace policy', async () => {
    const buf = await readFileAsync('./spec/authoring-api/test-data/policy.json');
    const originalPolicy = JSON.parse(buf.toString());

    const newPolicy = {
      policies: [
        {
          group: 'default',
          user: '00000000-0000-0000-0000-000000000000',
          contexts: {
            another_property_test: '*',
          },
          object: '*',
          action: '*',
          effect: 'allow',
        },
        ...originalPolicy.policies,
      ],
    };

    await pollUntil(
      () => getObjectContentFromMinio('security/policy.json'),
      res => expect(JSON.parse(res)).to.deep.equal(originalPolicy),
    );

    await clients.authoring
      .put('/api/policies?author.name=test&author.email=test@soluto.com')
      .send(newPolicy)
      .expect(200);

    await pollUntil(
      () => getObjectContentFromMinio('security/policy.json'),
      res => expect(JSON.parse(res)).to.deep.equal(newPolicy),
    );
  });

  it('update policy', async () => {
    const buf = await readFileAsync('./spec/authoring-api/test-data/policy.json');
    const originalPolicy = JSON.parse(buf.toString());

    const policy = {
      policies: [
        {
          group: 'default',
          user: '00000000-0000-0000-0000-000000000000',
          contexts: {
            another_property_test: '*',
          },
          object: '*',
          action: '*',
          effect: 'allow',
        },
        ...originalPolicy.policies,
      ],
    };

    await pollUntil(
      () => getObjectContentFromMinio('security/policy.json'),
      res => expect(JSON.parse(res)).to.deep.equal(policy),
    );

    const policyPatch = jsonpatch.compare(policy, originalPolicy);
    await clients.authoring
      .patch('/api/policies?author.name=test&author.email=test@soluto.com')
      .send(policyPatch)
      .expect(200);

    const newPolicy = originalPolicy;

    await pollUntil(
      () => getObjectContentFromMinio('security/policy.json'),
      res => expect(JSON.parse(res)).to.deep.equal(newPolicy),
    );
  });
});
