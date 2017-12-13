const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');

const originalKey = 'integration_tests/some_key';
const aliasKey = 'integration_tests/alias_key';

describe('tweek api - key aliases', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('should have the same value as the original key', async () => {
    const original = await clients.api.get(`/api/v1/keys/${originalKey}`);
    const alias = await clients.api.get(`/api/v1/keys/${aliasKey}`);

    expect(JSON.parse(original.body)).to.equal(JSON.parse(alias.body));
  });
});
