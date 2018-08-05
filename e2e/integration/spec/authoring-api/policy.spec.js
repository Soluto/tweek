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
    const buf = await readFileAsync('./spec/authoring-api/test-data/policy.json');

    const originalPolicy = JSON.parse(buf.toString());
    const newPolicy = {
      policies: [
        ...originalPolicy.policies,
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
});
