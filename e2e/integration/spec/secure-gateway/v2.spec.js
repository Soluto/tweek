const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');

describe('Secure Gateway v2', () => {
  const key = 'integration_tests/some_key';

  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('get key (proxy to api service)', async () => {
    const result = await clients.gateway.get(`/api/v2/values/${key}`).expect(200, '1.0');
  });

  it('checks that the api calls are proxied through gateway', async () =>
    await clients.api
      .get('/version')
      .expect('X-GATEWAY', 'true')
      .expect(200));

  it('checks that the authoring calls are proxied through gateway', async () =>
    await clients.authoring
      .get('/version')
      .expect('X-GATEWAY', 'true')
      .expect(200));

  it('checks that the management calls are proxied through gateway', async () =>
    await clients.management
      .get('/version')
      .expect('X-GATEWAY', 'true')
      .expect(200));
});
