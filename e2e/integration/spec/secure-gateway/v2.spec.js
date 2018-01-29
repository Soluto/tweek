const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');

describe('Secure Gateway', () => {
  const key = 'integration_tests/some_key';

  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('V22222', async () => {
    const result = await clients.gateway.get(`/api/v2/values/${key}`);
    console.log('RESULT', result.statusCode);
  });
});
