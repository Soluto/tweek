const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');
const { pollUntil } = require('../../utils/utils');
const { getObjectContentFromMinio } = require('../../utils/minio');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

describe('authoring api extraction rules', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('update extraction rules', async () => {
    const buf = await readFileAsync('./spec/authoring-api/test-data/rules.rego');

    const originalRules = buf.toString();
    const newRules = originalRules + '\n'; // only adding new line in order not to break the original rules

    await pollUntil(
      () => getObjectContentFromMinio('security/rules.rego'),
      res => expect(res).to.equal(originalRules),
    );

    await clients.authoring
      .put('/api/extraction-rules?author.name=test&author.email=test@soluto.com')
      .send({ extraction_rules: newRules })
      .expect(200);

    await pollUntil(
      () => getObjectContentFromMinio('security/rules.rego'),
      res => expect(res).to.equal(newRules),
    );
  });
});
