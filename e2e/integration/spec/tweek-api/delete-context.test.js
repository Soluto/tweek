const uuid = require('uuid/v4');
const client = require('../../utils/client');

const identityType = 'user';

describe('tweek api - delete context', () => {
  it('should delete context', async () => {
    const identityId = 'delete_context_user';
    const url = `/api/v2/context/${identityType}/${identityId}`;

    await client
      .post(url)
      .send({ prop: 'value' })
      .expect(200);

    await client.delete(url).expect(200);

    await client.get(url).expect(200, {});
  });

  it("should succeed deleting a context that doesn't exist", async () => {
    const identityId = uuid();

    const url = `/api/v2/context/${identityType}/${identityId}`;

    await client.delete(url).expect(200);
  });
});
