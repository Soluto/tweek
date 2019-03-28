const { expect } = require('chai');
const client = require('../../../utils/client');

describe('tweek api - ignore key type', () => {
  const testCases = {
    'smoke_tests/ignore_key_types/string_type': 'hello',
    'smoke_tests/ignore_key_types/number_type': 15,
    'smoke_tests/ignore_key_types/boolean_type': true,
    'smoke_tests/ignore_key_types/object_type': { key: 'value' },
    'smoke_tests/ignore_key_types/array_type': ['hello', 'world'],
  };

  Object.entries(testCases).forEach(([keyPath, value]) => {
    it(`[$ignoreKeyTypes = true] - ${keyPath}`, async () => {
      const expected = typeof value === 'string' ? value : JSON.stringify(value);

      const response = await client
        .get(`/api/v2/values/${keyPath}?$ignoreKeyTypes=true`)
        .expect(200);
      expect(response.body).to.deep.equal(expected);
    });

    it(`[$ignoreKeyTypes = false] - ${keyPath}`, async () => {
      const response = await client
        .get(`/api/v2/values/${keyPath}?$ignoreKeyTypes=false`)
        .expect(200);

      expect(response.body).to.deep.equal(value);
    });
  });
});
