const client = require('../../utils/client');

describe('Gateway v2 CORS tests', () => {
  const key = 'integration_tests/some_key';

  it('Test GET request', async () => {
    await client
      .options(`/api/v2/values/${key}`)
      .set('Origin', 'tweek.test.origin')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Origin,Accept,Content-Type')
      .expect(204)
      .expect('access-control-allow-credentials', 'true')
      .expect('access-control-allow-headers', 'Origin, Accept, Content-Type')
      .expect('access-control-allow-methods', 'GET')
      .expect('access-control-allow-origin', '*')
      .expect('access-control-max-age', '60');
  });
});
