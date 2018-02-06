const chai = require('chai');
const expect = chai.expect;
chai.should();
const { init: initClients } = require('../../utils/clients');
const { pollUntil } = require('../../utils/utils');

const createManifestForJPadKey = key_path => ({
  key_path: `${key_path}`,
  meta: {
    name: 'aaaaaaa',
    tags: [],
    description: '',
    archived: false,
  },
  implementation: {
    type: 'file',
    format: 'jpad',
  },
  valueType: 'number',
  dependencies: [],
  enabled: true,
});

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
        () =>
          clients.api.get(
            '/api/keys/@tests/integration/new_valid_key?author.name=test&author.email=test@soluto.com',
          ),
        res => expect(JSON.parse(res.body)).to.eql('test'),
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
  });
});
