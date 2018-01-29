const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');

describe('Secure Gateway', () => {
  const key = 'integration_tests/some_key';

  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('V11111', async () => {
    const result = await clients.gateway.get(`/api/v1/keys/${key}`).set('Host', 'api');
    console.log('RESULT', result.statusCode);
    console.log('RESULT', result.data);
  });
});
