const client = require('../../utils/client');

const keyPath = 'path/to/key';
const secondKeyPath = 'wildcard/path/*';
const author = { name: 'ellie', email: 'ellie@lou.com' };
const authorQuery = { 'author.name': author.name, 'author.email': author.email };
const hook = { type: 'notification_webhook', url: 'http://not-a-real-domain/hook' };
const anotherHook = { type: 'notification_webhook', url: 'http://another-fake-domain/hook' };

describe('authoring api hooks', () => {
  beforeEach(async () => {
    await deleteAllHooks();
  });

  describe('POST /hooks/:keyPath/?author.name=name&author.email=email', () => {
    it('creates hooks that are grouped by the keyPath', async () => {
      await client
        .post(`/api/v2/hooks/${keyPath}`)
        .query(authorQuery)
        .send(hook)
        .expect(204);

      await client
        .post(`/api/v2/hooks/${keyPath}`)
        .query(authorQuery)
        .send(anotherHook)
        .expect(204);

      await client
        .post(`/api/v2/hooks/${secondKeyPath}`)
        .query(authorQuery)
        .send(anotherHook)
        .expect(204);

      const expectedHooks = [
        { keyPath, ...hook, hookIndex: 0 },
        { keyPath, ...anotherHook, hookIndex: 1 },
        { keyPath: secondKeyPath, ...anotherHook, hookIndex: 0 },
      ];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });

  describe('GET /hooks/:keyPath', () => {
    it('returns all hooks for the given keyPath', async () => {
      await createHook(keyPath, hook);
      await createHook(keyPath, anotherHook);
      await createHook(secondKeyPath, hook);

      const expectedHooks = [
        { keyPath, ...hook, hookIndex: 0 },
        { keyPath, ...anotherHook, hookIndex: 1 },
      ];

      return client.get(`/api/v2/hooks/${keyPath}`).expect(200, expectedHooks);
    });
  });

  describe('PUT /hooks/:keyPath/?hookIndex=2&author.name=name&author.email=email', () => {
    it('updates a hook', async () => {
      await createHook(keyPath, hook);

      const newHook = { type: 'notification_webhook', url: 'http://updated-url-domain/hook' };

      await client
        .put(`/api/v2/hooks/${keyPath}`)
        .query({ ...authorQuery, hookIndex: 0 })
        .send(newHook)
        .expect(204);

      const expectedHooks = [{ keyPath, ...newHook, hookIndex: 0 }];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });

  describe('DELETE /hooks/:keyPath/?hookIndex=1&author.name=name&author.email=email', () => {
    it('deletes a hook', async () => {
      await createHook(keyPath, hook);
      await createHook(keyPath, anotherHook);

      await client
        .delete(`/api/v2/hooks/${keyPath}`)
        .query({ ...authorQuery, hookIndex: 1 })
        .expect(204);

      const expectedHooks = [{ keyPath, ...hook, hookIndex: 0 }];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });

  describe('GET /hooks', () => {
    it('returns all hooks from the hooks file in a flattened array', async () => {
      await createHook(keyPath, hook);
      await createHook(keyPath, anotherHook);
      await createHook(secondKeyPath, hook);

      const expectedHooks = [
        { keyPath, ...hook, hookIndex: 0 },
        { keyPath, ...anotherHook, hookIndex: 1 },
        { keyPath: secondKeyPath, ...hook, hookIndex: 0 },
      ];

      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });
});

async function deleteAllHooks() {
  const allHooks = await client.get('/api/v2/hooks');

  const hooksByKeyPath = allHooks.body.reduce((acc, hook) => {
    acc[hook.keyPath] = acc[hook.keyPath] || [];

    acc[hook.keyPath].push(hook);
    return acc;
  }, {});

  for (const hooks of Object.values(hooksByKeyPath)) {
    hooks.sort((hook1, hook2) => hook2.hookIndex - hook1.hookIndex);

    for (const { keyPath, hookIndex } of hooks) {
      await client.delete(`/api/v2/hooks/${keyPath}`).query({ ...authorQuery, hookIndex });
    }
  }
}

function createHook(keyPath, hook) {
  return client
    .post(`/api/v2/hooks/${keyPath}`)
    .query(authorQuery)
    .send(hook);
}
