const client = require('../../utils/client');
const { delay } = require('../../utils/utils');
const jsonpatch = require('fast-json-patch');

describe(`testing to make sure hooks is only readable if authenticated `, () => {
  const authorizedAppId = 'auth-app-id';
  const unAuthorizedAppId = 'unauth-app-id';

  it('authorized app gets 200', async () => {
    const response = await client
    .post('/api/v2/apps')
    .send({ name: authorizedAppId, permissions: [] })
    .expect(200);

    const { appId, appSecret } = response.body;

    const policiesRes = await client.get('/api/v2/policies').expect(200);
    const currentPolicies = policiesRes.body;
    const newPolicies = {
      policies: [
        ...currentPolicies.policies,
        {
          group: 'externalapps',
          user: appId,
          object: 'repo',
          contexts: {},
          action: 'read',
          effect: 'allow',
        },
        {
          group: 'externalapps',
          user: appId,
          object: 'repo/hooks',
          contexts: {},
          action: 'read',
          effect: 'allow',
        }
      ],
    };
    const patch = jsonpatch.compare(currentPolicies, newPolicies);

    await client
    .patch('/api/v2/policies')
    .send(patch)
    .expect(200);

    const appClient = await client.with((client) =>
      client
        .set({ 'x-client-id': appId, 'x-client-secret': appSecret })
        .unset('Authorization'),
    );

    await delay(3000);
    await appClient.get('/api/v2/schemas').expect(200);
    await appClient.get('/api/v2/hooks').expect(200);
  });

  it('unauthorized app gets 403', async () => {
    const response = await client
    .post('/api/v2/apps')
    .send({ name: unAuthorizedAppId, permissions: [] })
    .expect(200);

    const { appId, appSecret } = response.body;

    const policiesRes = await client.get('/api/v2/policies').expect(200);
    const currentPolicies = policiesRes.body;
    const newPolicies = {
      policies: [
        ...currentPolicies.policies,
        {
          group: 'externalapps',
          user: appId,
          object: 'repo',
          contexts: {},
          action: 'read',
          effect: 'allow',
        }
      ],
    };
    const patch = jsonpatch.compare(currentPolicies, newPolicies);

    await client
    .patch('/api/v2/policies')
    .send(patch)
    .expect(200);

    const appClient = await client.with((client) =>
      client
        .set({ 'x-client-id': appId, 'x-client-secret': appSecret })
        .unset('Authorization'),
    );

    await delay(3000);
    await appClient.get('/api/v2/schemas').expect(200);
    await appClient.get('/api/v2/hooks').expect(403);
  });
});