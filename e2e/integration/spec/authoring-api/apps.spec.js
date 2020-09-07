const client = require('../../utils/client');

const author = { name: 'James Bond', email: 'james.bond@email.com' };

describe('authoring external apps', () => {
  let appId;
  let defaultAppSecret;
  let customKeyId;
  let customKeySecret;
  it('create app', async () => {
    await client
      .post('/api/v2/apps')
      .expect(200)
      .then((res) => {
        appId = res.body.appId;
        defaultAppSecret = res.body.appSecret;
      });
  });

  it('update app', async () => {
    await client
      .patch(`/api/v2/apps/${appId}`)
      .expect(204);
  });

  it('get apps', async () => {
    await client.get('/api/v2/apps').expect(200);
  });

  it('create key', async () => {
    await client
      .post(`/api/v2/apps/${appId}/keys`)
      .expect(200)
      .then((res) => {
        customKeyId = res.body.keyId;
        customKeySecret = res.body.secret;
      });
  });

  it('get keys', async () => {
    await client.get(`/api/v2/apps/${appId}/keys`).expect(200);
  });

  it('get key', async () => {
    await client.get(`/api/v2/apps/${appId}/keys/${customKeyId}`).expect(200);
  });

  it('delete key', async () => {
    await client.delete(`/api/v2/apps/${appId}/keys/${customKeyId}`).expect(204);
  });

  it('get app', async () => {
    await client.get(`/api/v2/apps/${appId}`).expect(200);
  });

  it('delete app', async () => {
    await client.delete(`/api/v2/apps/${appId}`).expect(204);
  });
});
