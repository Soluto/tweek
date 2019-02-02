const { expect } = require('chai');
const clients = require('../../utils/clients');
const { pollUntil } = require('../../utils/utils');

describe('authoring api - /PUT /bulk-keys-upload', () => {
  it('should not accept an input without a zip file named bulk', async () => {
    await clients.gateway
      .put('/api/v2/bulk-keys-upload')
      .expect(400, 'Required file is missing: bulk');
  });

  it('should not accept a corrupted zip file', async () => {
    await clients.gateway
      .put('/api/v2/bulk-keys-upload')
      .attach('bulk', './spec/authoring-api/test-data/notZip.zip')
      .expect(400, /^Zip is corrupted:/);
  });

  it('should not accept a zip file with invalid structure', async () => {
    await clients.gateway
      .put('/api/v2/bulk-keys-upload')
      .attach('bulk', './spec/authoring-api/test-data/invalidStructure.zip')
      .expect(400);
  });

  it('should not accept a zip file with invalid rules', async () => {
    await clients.gateway
      .put('/api/v2/bulk-keys-upload')
      .attach('bulk', './spec/authoring-api/test-data/invalidRules.zip')
      .expect(400);
  });

  it('should accept a zip file and update rules', async () => {
    await clients.gateway.delete('/api/v2/keys/test_key1').expect(200);

    await clients.gateway
      .put('/api/v2/bulk-keys-upload')
      .attach('bulk', './spec/authoring-api/test-data/bulk1.zip')
      .expect('x-oid', /.+/)
      .expect(204);

    await pollUntil(
      () =>
        clients.gateway.get('/api/v1/keys/test_key1?user.Country=country&user.ClientVersion=1.0.0'),
      (res) => expect(JSON.parse(res.body)).to.eql(true),
    );
  });
});
