const { init: initClients } = require('../utils/clients');
const { waitUntil } = require('../utils/utils');

before('wait for authoring and api', async () => {
  const clients = await initClients();

  waitUntil(() => clients.authoring.get('/health').expect(200));
  console.log('Authoring is ready');
  waitUntil(() => clients.api.get('/health').expect(200));
  console.log('Api is ready');
});
