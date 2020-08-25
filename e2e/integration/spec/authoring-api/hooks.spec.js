const client = require('../../utils/client');

const author = { name: 'ellie', email: 'ellie@lou.com' };
const authorQuery = { 'author.name': author.name, 'author.email': author.email };

describe('authoring api hooks', () => {
  let hook1, hook2, hook3;

  beforeEach(async () => {
    await _deleteAllHooks();

    hook1 = {
      keyPath: 'path/to/key',
      type: 'notification_webhook',
      url: 'http://not-a-real-domain/hook',
    };
    hook2 = {
      keyPath: 'path/to/key',
      type: 'notification_webhook',
      url: 'http://another-fake-domain/hook',
    };
    hook3 = {
      keyPath: 'wildcard/path/*',
      type: 'notification_webhook',
      url: 'http://not-a-real-domain/hook',
    };
  });

  describe('GET /hooks', () => {
    it('returns all hooks from the hooks file', async () => {
      await _createHooks(hook1, hook2, hook3);

      const expectedHooks = [hook1, hook2, hook3];

      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });

    it('returns hooks filtered by the keyPathFilter query param', async () => {
      await _createHooks(hook1, hook2, hook3);

      const expectedHooks = [hook1, hook2];

      return client
        .get('/api/v2/hooks')
        .query({ keyPathFilter: 'path/to/key' })
        .expect(200, expectedHooks);
    });
  });

  describe('POST /hooks', () => {
    it('creates a hook', async () => {
      await _createHook(hook1);

      const expectedHooks = [hook1];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });

  describe('PUT /hooks/:id', () => {
    it('updates a hook', async () => {
      await _createHook(hook1);

      const updatedHook = {
        ...hook1,
        keyPath: 'new/key/path',
        url: 'http://updated-url-domain/hook',
      };
      const etag = await _getETag();

      await client
        .put(`/api/v2/hooks/${hook1.id}`)
        .set('If-Match', etag)
        .query(authorQuery)
        .send(updatedHook)
        .expect(204);

      const expectedHooks = [updatedHook];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });

  describe('DELETE /hooks/:id', () => {
    it('deletes a hook', async () => {
      await _createHooks(hook1, hook2);

      const etag = await _getETag();

      await client
        .delete(`/api/v2/hooks/${hook1.id}`)
        .set('If-Match', etag)
        .query(authorQuery)
        .expect(204);

      const expectedHooks = [hook2];
      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });
});

async function _deleteAllHooks() {
  const { body: allHooks } = await client.get('/api/v2/hooks');

  for (const { id } of allHooks) {
    await client
      .delete(`/api/v2/hooks/${id}`)
      .query(authorQuery)
      .expect(204);
  }
}

async function _createHook(hook) {
  const res = await client
    .post('/api/v2/hooks')
    .query(authorQuery)
    .send(hook)
    .expect(201);

  hook.id = res.body.id;
}

async function _createHooks(...hooks) {
  for (const hook of hooks) await _createHook(hook);
}

async function _getETag() {
  const res = await client.get('/api/v2/hooks').expect(200);
  return res.headers.etag;
}
