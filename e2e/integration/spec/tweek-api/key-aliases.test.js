const { expect } = require('chai');
const clients = require('../../utils/clients');

const originalKey = 'integration_tests/some_key';
const aliasKey = 'integration_tests/alias_key';

describe('tweek api - key aliases', () => {
  it('should have the same value as the original key', async () => {
    const original = await clients.gateway.get(`/api/v2/values/${originalKey}`);
    const alias = await clients.gateway.get(`/api/v2/values/${aliasKey}`);

    expect(JSON.parse(original.body)).to.equal(JSON.parse(alias.body));
  });
});
