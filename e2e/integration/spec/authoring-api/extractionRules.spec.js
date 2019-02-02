const { expect } = require('chai');
const client = require('../../utils/client');
const { pollUntil } = require('../../utils/utils');
const { getObjectContentFromMinio } = require('../../utils/minio');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

describe('authoring api extraction rules', () => {
  it('update extraction rules', async () => {
    const buf = await readFileAsync('./spec/authoring-api/test-data/subject_extraction_rules.rego');

    const originalRules = buf.toString();
    const newRules = originalRules + '\n'; // only adding new line in order not to break the original rules

    await pollUntil(
      () => getObjectContentFromMinio('security/subject_extraction_rules.rego'),
      (res) => expect(res).to.contain(originalRules),
    );

    await client
      .put('/api/v2/jwt-extraction-policy')
      .send({ data: newRules })
      .expect(200);

    const res = await client.get('/api/v2/jwt-extraction-policy').expect(200);

    expect(res.body.data).to.equal(newRules);

    await pollUntil(
      () => getObjectContentFromMinio('security/subject_extraction_rules.rego'),
      (res) => expect(res).to.equal(newRules),
    );
  });
});
