const uuid = require('uuid/v4');
const clients = require('../../utils/clients');

const identityType = 'user';

describe('tweek api - delete context', () => {
  it('should delete context', async () => {
    const identityId = 'delete_context_user';
    const url = `/api/v2/context/${identityType}/${identityId}`;

    await clients.gateway
      .post(url)
      .send({ prop: 'value' })
      .expect(200);

    await clients.gateway.delete(url).expect(200);

    await clients.gateway.get(url).expect(200, {});
  });

  it("should succeed deleting a context that doesn't exist", async () => {
    const identityId = uuid();

    const url = `/api/v2/context/${identityType}/${identityId}`;

    await clients.gateway.delete(url).expect(200);
  });
});
