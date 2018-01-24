const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');

describe('Secure Gateway', () => {
  const key = 'integration_tests/some_key';

  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('AAAAAAAAAAAAA', async () => {
    const result = await clients.gateway.get(`/api/values/${key}`);
    console.log('RESULT', result);
  });
});
