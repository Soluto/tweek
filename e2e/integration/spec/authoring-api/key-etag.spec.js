const { expect } = require('chai');
const client = require('../../utils/client');
const { pollUntil } = require('../../utils/utils');
const { createManifestForJPadKey, createManifestForJPadKeyTemp } = require('../../utils/manifest');

const keyPath = '@tests/integration/new_key_with_etag';
const author = { name: 'ellie', email: 'ellie@lou.com' };
const authorQuery = { 'author.name': author.name, 'author.email': author.email };

describe('Key etag', () => {
  let etag;
  it('Create new key', async () => {
    await client
      .put(`/api/v2/keys/${keyPath}`)
      .query(authorQuery)
      .send({
        manifest: createManifestForJPadKey(keyPath),
        implementation: JSON.stringify({
          partitions: [],
          defaultValue: 'test',
          valueType: 'string',
          rules: [],
        }),
      })
      .expect(200);

    await pollUntil(
      () => client.get(`/api/v2/values/${keyPath}`),
      (res) => expect(res.body).to.eql('test'),
    );
  });

  it('Create new key with invalid characters, expect fail', async () => {
    await client
      .put(`/api/v2/keys/${keyPath}`)
      .query(authorQuery)
      .send({
        manifest: { ...createManifestForJPadKey(keyPath), ...{ dependencies: ['@/Invalid*234@#$'] } },
        implementation: JSON.stringify({
          partitions: [],
          defaultValue: 'test',
          valueType: 'string',
          rules: [],
        }),
      })
      .expect(400);

    await pollUntil(
      () => client.get(`/api/v2/values/${keyPath}`),
      (res) => expect(res.body).to.eql('test'),
    );
  });

  it('Create new key with invalid name, expect fail', async () => {
    await client
      .put(`/api/v2/keys/${keyPath}`)
      .query(authorQuery)
      .send({
        manifest: createManifestForJPadKeyTemp(keyPath),
        implementation: JSON.stringify({
          partitions: [],
          defaultValue: 'test',
          valueType: 'string',
          rules: [],
        }),
      })
      .expect(400);

    await pollUntil(
      () => client.get(`/api/v2/values/${keyPath}`),
      (res) => expect(res.body).to.eql('test'),
    );
  });

  it('GET key with Etag', async () => {
    await client.get(`/api/v2/keys/${keyPath}`).then((res) => {
      etag = res.headers.etag;
    });
    expect(etag).to.be.not.undefined;
  });

  it('Update key with right Etag', async () => {
    await client
      .put(`/api/v2/keys/${keyPath}`)
      .query(authorQuery)
      .send({
        manifest: createManifestForJPadKey(keyPath),
        implementation: JSON.stringify({
          partitions: [],
          defaultValue: 'test2',
          valueType: 'string',
          rules: [],
        }),
      })
      .set('If-Match', etag)
      .expect(200);

    await pollUntil(
      () => client.get(`/api/v2/values/${keyPath}`),
      (res) => expect(res.body).to.eql('test2'),
    );
  });

  it('Update key with wrong Etag', async () => {
    await client
      .put(`/api/v2/keys/${keyPath}`)
      .query(authorQuery)
      .send({
        manifest: createManifestForJPadKey(keyPath),
        implementation: JSON.stringify({
          partitions: [],
          defaultValue: 'test3',
          valueType: 'string',
          rules: [],
        }),
      })
      .set('If-Match', etag)
      .expect(412);
  });
});
