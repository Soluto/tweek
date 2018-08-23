const bluebird = require('bluebird');
const { init: initClients } = require('../../utils/clients');
const policies = [
  {
    object: 'repo',
    action: 'read',
  },
  {
    object: 'repo/schemas',
    action: 'write',
  },
];

const { expect } = require('chai');

describe('Gateway v2 - App Policies', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });
  const cases = [
    {
      name: 'read_specific_key',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/keys/integration_tests/some_key').expect(200);
      },
    },
    {
      name: 'read_specific_key 2',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/keys?keyPath=integration_tests/some_key').expect(200);
      },
    },
    {
      name: 'read_manifests',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/manifests/integration_tests/some_key').expect(200);
      },
    },
    {
      name: 'list_keys',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/keys').expect(200);
      },
    },
    {
      name: 'list_manifests',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/manifests').expect(200);
      },
    },
    {
      name: 'get_dependents',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/dependents/integration_tests/some_key').expect(200);
      },
    },
    {
      name: 'get_schemas',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/schemas').expect(200);
      },
    },
    {
      name: 'search',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/search').expect(200);
      },
    },
    {
      name: 'suggestions',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/suggestions').expect(200);
      },
    },
    {
      name: 'search-index',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/search-index').expect(200);
      },
    },
    {
      name: 'revision-history',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: async client => {
        await client.get('/api/v2/revision-history/integration_tests/some_key').expect(200);
      },
    },

    {
      name: 'post_schemas',
      requirePermissionObject: 'repo/schemas',
      requirePermissionAction: 'write',
      action: async client => {
        await client
          .post('/api/v2/schemas/new_identity?author.name=test&author.email=test@tweek.com')
          .send({ test: { type: 'string' } })
          .expect(200);
      },
    },

    {
      name: 'delete_schemas',
      requirePermissionObject: 'repo/schemas',
      requirePermissionAction: 'write',
      action: async client => {
        await client
          .delete('/api/v2/schemas/new_identity?author.name=test&author.email=test@tweek.com')
          .expect(200);
      },
    },
  ];

  for (let policy of policies) {
    it(`testing permission ${policy.object} - ${policy.action}`, async () => {
      const relevantCases = cases.filter(
        c =>
          c.requirePermissionObject === policy.object &&
          c.requirePermissionAction === policy.action,
      );
      const forbiddenCases = cases.filter(
        c =>
          c.requirePermissionObject !== policy.object ||
          c.requirePermissionAction !== policy.action,
      );

      const response = await clients.gateway
        .post('/api/v2/apps?author.name=test&author.email=test@soluto.com')
        .send({ name: 'my-app', permissions: [] })
        .expect(200);

      const { appId, appSecret } = response.body;

      await clients.gateway
        .patch('/api/v2/policies?author.name=test&author.email=test@soluto.com')
        .send([
          {
            op: 'add',
            path: '/policies/1',
            value: {
              ...policy,
              group: 'externalapps',
              user: appId,
              contexts: {},
              effect: 'allow',
            },
          },
        ])
        .expect(200);

      const appClient = await clients.gateway.with(client =>
        client.set({ 'x-client-id': appId, 'x-client-secret': appSecret }).unset('Authorization'),
      );

      await bluebird.delay(2000);

      await Promise.all(relevantCases.map(x => x.action(appClient)));

      await Promise.all(
        forbiddenCases.map(async x => {
          await x.action(appClient).then(
            () => true,
            ex => {
              return expect(ex.message).to.contain('403');
            },
          );
        }),
      );
    });
  }
});
