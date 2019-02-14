const { expect } = require('chai');
const client = require('../../utils/client');
const { pollUntil } = require('../../utils/utils');
const { createManifestForJPadKey } = require('../../utils/manifest');

describe('authoring api write validation', () => {
  describe('/PUT /key', () => {
    it('should accept a valid key', async () => {
      const key = '@tests/integration/new_valid_key';
      await client
        .put(
          '/api/v2/keys/@tests/integration/new_valid_key?author.name=test&author.email=test@soluto.com',
        )
        .send({
          manifest: createManifestForJPadKey(key),
          implementation: JSON.stringify({
            partitions: [],
            defaultValue: 'test',
            valueType: 'string',
            rules: [],
          }),
        })
        .expect(200);

      await pollUntil(
        () => client.get('/api/v2/values/@tests/integration/new_valid_key'),
        (res) => expect(res.body).to.eql('test'),
      );
    });

    it('should reject an invalid key with 400 error', async () => {
      const key = '@tests/integration/new_invalid_key';
      await client
        .put(
          '/api/v2/keys/@tests/integration/new_invalid_key?author.name=test&author.email=test@soluto.com',
        )
        .send({
          manifest: createManifestForJPadKey(key),
          implementation: JSON.stringify({
            partitins: [],
            defaultalue: 'test',
            valuType: 'string',
            ruls: [],
          }),
        })
        .expect(400);
    });

    it('should not create new commit for duplicate definition', async () => {
      const key = '@tests/integration/duplicate';

      await client.delete(`/api/v2/keys/${key}`).expect(200);

      async function saveKey() {
        return await client
          .put(`/api/v2/keys/${key}`)
          .send({
            manifest: createManifestForJPadKey(key),
            implementation: JSON.stringify({
              partitions: [],
              defaultValue: 'test',
              valueType: 'string',
              rules: [],
            }),
          })
          .expect(200);
      }
      const res1 = await saveKey();
      expect(res1.header).to.have.property('x-oid');
      const res2 = await saveKey();
      expect(res2.header).to.not.have.property('x-oid');
    });
  });
});
