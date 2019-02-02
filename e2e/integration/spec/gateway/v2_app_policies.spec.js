const bluebird = require('bluebird');
const clients = require('../../utils/clients');

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

describe('Gateway v2 - App Policies', () => {
  const cases = [
    {
      name: 'read_specific_key',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/keys/integration_tests/some_key'),
    },
    {
      name: 'read_specific_key 2',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/keys?keyPath=integration_tests/some_key'),
    },
    {
      name: 'read_manifests',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/manifests/integration_tests/some_key'),
    },
    {
      name: 'list_keys',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/keys'),
    },
    {
      name: 'list_manifests',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/manifests'),
    },
    {
      name: 'get_dependents',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/dependents/integration_tests/some_key'),
    },
    {
      name: 'get_schemas',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/schemas'),
    },
    {
      name: 'search',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/search'),
    },
    {
      name: 'suggestions',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/suggestions'),
    },
    {
      name: 'search-index',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/search-index'),
    },
    {
      name: 'revision-history',
      requirePermissionObject: 'repo',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/revision-history/integration_tests/some_key'),
    },

    {
      name: 'delete_schemas',
      requirePermissionObject: 'repo/schemas',
      requirePermissionAction: 'write',
      action: (client) =>
        client.delete('/api/v2/schemas/new_identity?author.name=test&author.email=test@tweek.com'),
    },
    {
      name: 'jwt_extraction_policy',
      requirePermissionObject: 'repo/policies',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/jwt-extraction-policy'),
    },
    {
      name: 'policies',
      requirePermissionObject: 'repo/policies',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/policies'),
    },
    {
      name: 'apps',
      requirePermissionObject: 'repo/apps',
      requirePermissionAction: 'read',
      action: (client) => client.get('/api/v2/apps'),
    },
  ];

  for (let policy of policies) {
    it(`testing permission ${policy.object} - ${policy.action}`, async () => {
      const relevantCases = cases.filter(
        (c) =>
          c.requirePermissionObject === policy.object &&
          c.requirePermissionAction === policy.action,
      );
      const forbiddenCases = cases.filter(
        (c) =>
          c.requirePermissionObject !== policy.object ||
          c.requirePermissionAction !== policy.action,
      );

      const response = await clients.gateway
        .post('/api/v2/apps')
        .send({ name: 'my-app', permissions: [] })
        .expect(200);

      const { appId, appSecret } = response.body;

      await clients.gateway
        .patch('/api/v2/policies')
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

      const appClient = await clients.gateway.with((client) =>
        client.set({ 'x-client-id': appId, 'x-client-secret': appSecret }).unset('Authorization'),
      );

      // should change to match {oid} with repo-version api
      await bluebird.delay(3000);

      await Promise.all(relevantCases.map((x) => x.action(appClient).expect(200)));

      await Promise.all(forbiddenCases.map(async (x) => x.action(appClient).expect(403)));
    });
  }
});
