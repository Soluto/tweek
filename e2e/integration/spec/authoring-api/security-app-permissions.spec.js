const { init: initClients } = require('../../utils/clients');
const permissions = [
  'keys-list',
  'keys-read',
  'keys-write',
  'schemas-read',
  'schemas-write',
  'history',
  'search',
  'search-index',
  'tags-read',
  'tags-write',
];
const { expect } = require('chai');

describe('authoring api - app permissions', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });
  const cases = [
    {
      name: 'read_specific_key',
      requirePermission: 'keys-read',
      action: client => client.get('/api/keys/integration_tests/some_key'),
    },
    {
      name: 'read_specific_key',
      requirePermission: 'keys-read',
      action: client => client.get('/api/key?keyPath=integration_tests%2Fsome_key'),
    },
    {
      name: 'read_manifests',
      requirePermission: 'keys-read',
      action: client => client.get('/api/manifests/integration_tests/some_key'),
    },
    {
      name: 'list_keys',
      requirePermission: 'keys-list',
      action: client => client.get('/api/keys'),
    },
    {
      name: 'list_manifests',
      requirePermission: 'keys-list',
      action: client => client.get('/api/manifests'),
    },
    {
      name: 'get_dependents',
      requirePermission: 'keys-read',
      action: client => client.get('/api/dependents/integration_tests/some_key'),
    },
    {
      name: 'get_dependents',
      requirePermission: 'keys-read',
      action: client => client.get('/api/dependents/integration_tests/some_key'),
    },
    {
      name: 'get_schemas',
      requirePermission: 'schemas-read',
      action: client => client.get('/api/schemas'),
    },
    {
      name: 'search',
      requirePermission: 'search',
      action: client => client.get('/api/search'),
    },
    {
      name: 'suggestions',
      requirePermission: 'search',
      action: client => client.get('/api/suggestions'),
    },
    {
      name: 'search-index',
      requirePermission: 'search-index',
      action: client => client.get('/api/search-index'),
    },
  ];

  for (let permission of permissions) {
    it(`testing permission ${permission}`, async () => {
      const relevantCases = cases.filter(c => c.requirePermission === permission);
      const forbiddenCases = cases.filter(c => c.requirePermission !== permission);

      let response = await clients.authoring
        .post('/api/apps?author.name=test&author.email=test@soluto.com')
        .send({ name: 'my-app', permissions: [permission] })
        .expect(200);

      let { appId, appSecret } = response.body;

      let appClient = await clients.authoring.with(client =>
        client.set({ 'x-client-id': appId, 'x-client-secret': appSecret }).unset('Authorization'),
      );

      await Promise.all(relevantCases.map(x => x.action(appClient).expect(200)));

      await Promise.all(
        forbiddenCases.map(async x => {
          try {
            await x.action(appClient).expect(403);
          } catch (e) {
            console.error(x);
          }
        }),
      );
    });
  }
});
