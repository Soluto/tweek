const client = require('../../utils/client');

const keyPath = 'path/to/key';
const secondKeyPath = 'wildcard/path/*';
const author = { name: 'ellie', email: 'ellie@lou.com' };
const authorQuery = { 'author.name': author.name, 'author.email': author.email };
const hook = { type: 'notification_webhook', url: 'http://not-a-real-domain/hook' };
const anotherHook = { type: 'notification_webhook', url: 'http://another-fake-domain/hook' };

describe('authoring api hooks', () => {
  beforeEach(async () => {
    await _deleteAllHooks();
  });

  describe('POST /hooks/:keyPath/?author.name=name&author.email=email', () => {
    it('creates hooks that are grouped by the keyPath', async () => {
      await _createHook(keyPath, hook);
      await _createHook(keyPath, anotherHook);
      await _createHook(secondKeyPath, anotherHook);

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
      await _createHook(keyPath, hook);
      await _createHook(keyPath, anotherHook);
      await _createHook(secondKeyPath, hook);

      const expectedHooks = [
        { keyPath, ...hook, hookIndex: 0 },
        { keyPath, ...anotherHook, hookIndex: 1 },
      ];

      return client.get(`/api/v2/hooks/${keyPath}`).expect(200, expectedHooks);
    });
  });

  describe('PUT /hooks/:keyPath/?hookIndex=2&author.name=name&author.email=email', () => {
    it('updates a hook', async () => {
      await _createHook(keyPath, hook);

      const newHook = { type: 'notification_webhook', url: 'http://updated-url-domain/hook' };
      const etag = await _getETag();

      await client
        .put(`/api/v2/hooks/${keyPath}`)
        .set('If-Match', etag)
        .query({ ...authorQuery, hookIndex: 0 })
        .send(newHook)
        .expect(204);

      const expectedHooks = [{ keyPath, ...newHook, hookIndex: 0 }];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });

  describe('DELETE /hooks/:keyPath/?hookIndex=1&author.name=name&author.email=email', () => {
    it('deletes a hook', async () => {
      await _createHook(keyPath, hook);
      await _createHook(keyPath, anotherHook);

      const etag = await _getETag();

      await client
        .delete(`/api/v2/hooks/${keyPath}`)
        .set('If-Match', etag)
        .query({ ...authorQuery, hookIndex: 1 })
        .expect(204);

      const expectedHooks = [{ keyPath, ...hook, hookIndex: 0 }];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });

  describe('GET /hooks', () => {
    it('returns all hooks from the hooks file in a flattened array', async () => {
      await _createHook(keyPath, hook);
      await _createHook(keyPath, anotherHook);
      await _createHook(secondKeyPath, hook);

      const expectedHooks = [
        { keyPath, ...hook, hookIndex: 0 },
        { keyPath, ...anotherHook, hookIndex: 1 },
        { keyPath: secondKeyPath, ...hook, hookIndex: 0 },
      ];

      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });
});

async function _deleteAllHooks() {
  while (true) {
    const {
      body: allHooks,
      headers: { etag },
    } = await client.get('/api/v2/hooks');
    if (allHooks.length === 0) return;

    const { keyPath, hookIndex } = allHooks[0];
    await client
      .delete(`/api/v2/hooks/${keyPath}`)
      .set('If-Match', etag)
      .query({ ...authorQuery, hookIndex })
      .expect(204);
  }
}

async function _createHook(keyPath, hook) {
  const etag = await _getETag();

  return client
    .post(`/api/v2/hooks/${keyPath}`)
    .set('If-Match', etag)
    .query(authorQuery)
    .send(hook)
    .expect(204);
}

async function _getETag() {
  const res = await client.get('/api/v2/hooks').expect(200);
  return res.headers.etag;
}
