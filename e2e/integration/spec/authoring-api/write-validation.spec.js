const chai = require('chai');
const expect = chai.expect;
chai.should();
const { init: initClients } = require('../../utils/clients');
const { pollUntil, createManifestForJPadKey } = require('../../utils/utils');

describe('authoring api', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  describe('/PUT /key', () => {
    it('should accept a valid key', async () => {
      let key = '@tests/integration/new_valid_key';
      await clients.authoring
        .put(
          '/api/keys/@tests/integration/new_valid_key?author.name=test&author.email=test@soluto.com',
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
        () => clients.api.get('/api/v1/keys/@tests/integration/new_valid_key'),
        res => expect(res.body).to.eql('test'),
      );
    });

    it('should reject an invalid key with 400 error', async () => {
      let key = '@tests/integration/new_invalid_key';
      await clients.authoring
        .put(
          '/api/keys/@tests/integration/new_invalid_key?author.name=test&author.email=test@soluto.com',
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
      let key = '@tests/integration/duplicate';
      async function saveKey() {
        return await clients.authoring
          .put(`/api/keys/${key}?author.name=test&author.email=test@soluto.com`)
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
      let res = await saveKey();
      expect(res.header).to.have.property('x-oid');
      res = await saveKey();
      expect(res.header).to.not.have.property('x-oid');
    });
  });
});
