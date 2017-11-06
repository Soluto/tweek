const { init: initClients } = require('../utils/clients');
const { waitUntil } = require('../utils/utils');

before('wait for authoring and api', async function() {
  this.timeout(0);
  const clients = await initClients();

  await Promise.all([
    waitUntil(() => clients.authoring.get('/health').expect(200), 60000, 1000),
    waitUntil(() => clients.api.get('/health').expect(200), 60000, 1000),
  ]);
});
