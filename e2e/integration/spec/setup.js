const chai = require('chai');
chai.should();

const { init: initClients } = require('../utils/clients');
const { waitUntil } = require('../utils/utils');

before('wait for authoring and api', async function() {
  this.timeout(0);
  const clients = await initClients();
  console.log('Waiting for api and authoring services to be healthy...(up to 1 min)');

  await Promise.all([
    waitUntil(() => clients.authoring.get('/health').expect(200), 60000, 1000),
    waitUntil(() => clients.api.get('/health').expect(200), 60000, 1000),
  ]);
});
