const chai = require('chai');
chai.should();

const clients = require('../utils/clients');
const { waitUntil } = require('../utils/utils');

before('wait for authoring and api', async function() {
  this.timeout(0);
  console.log('Waiting for api and authoring services to be healthy...(up to 1 min)');

  await waitUntil(() => clients.gateway.get('/status').expect(200), 60000, 1000);
});
