const client = require('../../utils/client');

const keyPath = 'path/to/key';
const secondKeyPath = 'wildcard/path/*';
const author = { name: 'ellie', email: 'ellie@lou.com' };
const authorQuery = { 'author.name': author.name, 'author.email': author.email };

describe('authoring api hooks', () => {
  describe('POST /hooks/:keyPath/?author.name=name&author.email=email', () => {
    it('creates a hook', async () => {
      const hook = { type: 'notification_webhook', url: 'http://not-a-real-domain/hook' };
      const anotherHook = { type: 'notification_webhook', url: 'http://another-fake-domain/hook' };

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
    });
  });

  describe('GET /hooks/:keyPath', () => {
    it('returns all hooks for the given keyPath', () => {
      const type = 'notification_webhook';
      const expectedHooks = [
        { keyPath, type, url: 'http://not-a-real-domain/hook', hookIndex: 0 },
        { keyPath, type, url: 'http://another-fake-domain/hook', hookIndex: 1 },
      ];

      return client.get(`/api/v2/hooks/${keyPath}`).expect(200, expectedHooks);
    });
  });

  describe('PUT /hooks/:keyPath/?hookIndex=2&author.name=name&author.email=email', () => {
    it('updates a hook', () => {
      const hook = { type: 'notification_webhook', url: 'http://updated-url-domain/hook' };

      return client
        .put(`/api/v2/hooks/${keyPath}`)
        .query({ ...authorQuery, hookIndex: 1 })
        .send(hook)
        .expect(204);
    });
  });

  describe('DELETE /hooks/:keyPath/?hookIndex=1&author.name=name&author.email=email', () => {
    it('deletes a hook', () => {
      return client
        .delete(`/api/v2/hooks/${keyPath}`)
        .query({ ...authorQuery, hookIndex: 0 })
        .expect(204);
    });
  });

  describe('GET /hooks', () => {
    it('returns all hooks from the hooks file in a flattened array', () => {
      const type = 'notification_webhook';
      const expectedHooks = [
        { keyPath, type, url: 'http://updated-url-domain/hook', hookIndex: 0 },
        { keyPath: secondKeyPath, type, url: 'http://another-fake-domain/hook', hookIndex: 0 },
      ];

      return client.get('/api/v2/hooks').expect(200, expectedHooks);
    });
  });
});
