const uuid = require('uuid/v4');
const { expect } = require('chai');
const client = require('../../utils/client');

const identityType = 'user';

describe('tweek api - context', () => {
  describe('append', () => {
    it('should succeed appending fixed configuration', async () => {
      const identityId = 'append-context-test-1';
      const url = `/api/v2/context/${identityType}/${identityId}`;
      const expected = uuid();

      await client
        .post(url)
        .send({ '@fixed:tests/fixed/some_fixed_configuration': expected })
        .expect(200);

      let result = await client.get(
        `/api/v2/values/tests/fixed/some_fixed_configuration?${identityType}=${identityId}`,
      );
      expect(result.body).to.equal(expected);

      const otherExpectedValue = uuid();

      await client
        .post(url)
        .send({
          '@fixed:tests/fixed/additional_fixed_configuration1': otherExpectedValue,
          '@fixed:tests/fixed/additional_fixed_configuration2': otherExpectedValue,
        })
        .expect(200);

      result = await client.get(`/api/v2/values/tests/fixed/_?${identityType}=${identityId}`);
      expect(result.body).to.deep.include({
        some_fixed_configuration: expected,
        additional_fixed_configuration1: otherExpectedValue,
        additional_fixed_configuration2: otherExpectedValue,
      });
    });

    it('should return bad response when trying to append context with bad property type', async () => {
      await client
        .post(`/api/v2/context/${identityType}/user-1`)
        .send({ AgentVersion: 'not a version' })
        .expect(400);
    });
  });

  describe('delete', () => {
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

    it('should succeed deleting fixed context', async () => {
      const identityId = 'delete-context-test-1';
      const url = `/api/v2/context/${identityType}/${identityId}`;
      const keyPath = 'tests/fixed/some_fixed_configuration_delete';
      const expected = uuid();

      await client
        .post(url)
        .send({ [`@fixed:${keyPath}`]: expected })
        .expect(200);

      let result = await client.get(`/api/v2/values/${keyPath}?${identityType}=${identityId}`);
      expect(result.body).to.equal(expected);

      await client.delete(`${url}/@fixed:${keyPath}`).expect(200);

      result = await client.get(`/api/v2/values/${keyPath}?${identityType}=${identityId}`);
      expect(result.body).to.equal(null);
    });
  });
});
