const { expect } = require('chai');
const client = require('../../../utils/client');

describe('tweek api  - propagate errors', () => {
  const identityType = 'user';
  const identityId = 'bad_context_user';
  const url = `/api/v2/values/integration_tests/include_errors`;

  before(async () => {
    await client
      .post(`/api/v2/context/${identityType}/${identityId}`)
      .send({ BadProperty: 'SomeString' })
      .expect(200);
  });

  describe('[includeErrors = true]', () => {
    it('should return null on single key error', async () => {
      const result = await client
        .get(`${url}?${identityType}=${identityId}&$includeErrors=true`)
        .expect('X-Error-Count', '1')
        .expect(200);
      expect(result.body).to.eql({
        data: null,
        errors: {
          'integration_tests/include_errors': 'non matching types',
        },
      });
    });

    it('should return correct value if no error', async () => {
      const result = await client
        .get(`${url}?$includeErrors=true`)
        .expect('X-Error-Count', '0')
        .expect(200);
      expect(result.body).to.eql({ data: 'DefaultValue', errors: {} });
    });

    it('should skip error key on scan', async () => {
      const result = await client
        .get(`/api/v2/values/integration_tests/_?${identityType}=${identityId}&$includeErrors=true`)
        .expect('X-Error-Count', '1')
        .expect(200);

      expect(result.body.data).to.not.have.property('include_errors');
      expect(result.body.errors).to.eql({
        'integration_tests/include_errors': 'non matching types',
      });
    });

    it('should return correct value if no error in scan', async () => {
      const result = await client
        .get(`/api/v2/values/integration_tests/_?$includeErrors=true`)
        .expect('X-Error-Count', '0')
        .expect(200);

      expect(result.body.data).to.deep.include({ include_errors: 'DefaultValue' });
      expect(result.body.errors).to.eql({});
    });
  });

  describe('[includeErrors = false]', () => {
    it('should return null on single key error', async () => {
      const result = await client
        .get(`${url}?${identityType}=${identityId}&$includeErrors=false`)
        .expect('X-Error-Count', '1')
        .expect(200);
      expect(result.body).to.eql(null);
    });

    it('should return correct value if no error', async () => {
      const result = await client
        .get(`${url}?$includeErrors=false`)
        .expect('X-Error-Count', '0')
        .expect(200);
      expect(result.body).to.eql('DefaultValue');
    });

    it('should skip error key on scan', async () => {
      const result = await client
        .get(`/api/v2/values/integration_tests/_?${identityType}=${identityId}&$includeErrors=true`)
        .expect('X-Error-Count', '1')
        .expect(200);

      expect(result.body).to.not.have.property('include_errors');
    });

    it('should return correct value if no error in scan', async () => {
      const result = await client
        .get(`/api/v2/values/integration_tests/_?$includeErrors=false`)
        .expect('X-Error-Count', '0')
        .expect(200);

      expect(result.body).to.deep.include({ include_errors: 'DefaultValue' });
    });
  });
});
