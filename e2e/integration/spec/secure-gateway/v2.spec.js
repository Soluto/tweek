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
});
