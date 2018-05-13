const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');
const { pollUntil } = require('../../utils/utils');
const { getObjectContentFromMinio } = require('../../utils/minio');

describe('authoring api - add app', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('allow creating new app with keys-read permission', async () => {
    const response = await clients.authoring
      .post('/api/apps?author.name=test&author.email=test@soluto.com')
      .send({ name: 'my-app', permissions: ['keys-read'] })
      .expect(200);

    const { appId, appSecret } = response.body;

    const appClient = await clients.authoring.with(client =>
      client.set({ 'x-client-id': appId, 'x-client-secret': appSecret }).unset('Authorization'),
    );

    await appClient.get('/api/keys/integration_tests/some_key').expect(200);

    await appClient.get('/api/keys').expect(403);
  });

  it('allow creating new app with invalid permission', async () => {
    await clients.authoring
      .post('/api/apps?author.name=test&author.email=test@soluto.com')
      .send({ name: 'my-app', permissions: ['admin'] })
      .expect(400);

    await clients.authoring
      .post('/api/apps?author.name=test&author.email=test@soluto.com')
      .send({ name: 'my-app', permissions: ['my-permission'] })
      .expect(400);
  });

  it('syncronyzes the app to minio', async () => {
    const response = await clients.authoring
      .post('/api/apps?author.name=test&author.email=test@soluto.com')
      .send({ name: 'my-app', permissions: ['keys-read'] })
      .expect(200);

    const { appId } = response.body;

    await pollUntil(
      () => getObjectContentFromMinio('external_apps.json'),
      res => expect(JSON.parse(res)).haveOwnProperty(appId),
    );
  });
});
