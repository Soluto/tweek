const client = require('../../../utils/client');

describe('tweek api - hidden keys', () => {
  it('get scan folder should return only visible keys', async () => {
    await client
      .get('/api/v2/values/smoke_tests/not_hidden/_')
      .expect(200, { some_key: 'some value' });
  });

  it('get hidden scan folder should return the folder', async () => {
    await client
      .get('/api/v2/values/smoke_tests/not_hidden/@hidden/_')
      .expect(200, { visible_key: 'visible value' });
  });

  it('get scan folder include hidden folder should return hidden folder', async () => {
    await client
      .get('/api/v2/values/smoke_tests/not_hidden/_?$include=_&$include=@hidden/_')
      .expect(200, {
        some_key: 'some value',
        '@hidden': {
          visible_key: 'visible value',
        },
      });
  });

  it('get hidden key should return hidden key', async () => {
    await client
      .get('/api/v2/values/smoke_tests/not_hidden/@some_hidden_key')
      .expect(200, '"some hidden value"');
  });
});
