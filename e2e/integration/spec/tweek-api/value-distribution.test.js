const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');

const objectFormatKey = 'integration_tests/value_distribution/object_format';
const arrayFormatKey = 'integration_tests/value_distribution/array_format';

describe('tweek api - value distribution', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('should get correct value - array format', async () => {
    const result = await clients.gateway.get(`/api/v2/values/${arrayFormatKey}?user=some_user`);
    expect(JSON.parse(result.body)).to.equal(15);
  });

  it('should get correct value - object format', async () => {
    const result = await clients.gateway.get(`/api/v2/values/${objectFormatKey}?user=some_user`);
    expect(JSON.parse(result.body)).to.equal(15);
  });
});
