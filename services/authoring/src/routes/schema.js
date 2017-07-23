const R = require('ramda');
const jsondiffpatch = require('jsondiffpatch');
const searchIndex = require('../search-index');

const schemaPrefix = `@tweek/schema/`;
const indexSchema = R.pipe(
  R.indexBy(manifest => manifest.key_path.substring(schemaPrefix.length)),
  R.map(R.path(['implementation', 'value'])),
);

async function getSchemas(req, res) {
  const allManifests = await searchIndex.manifests;
  const schemaManifests = allManifests.filter(m => m.key_path.startsWith(schemaPrefix));
  const schemas = indexSchema(schemaManifests);

  res.json(schemas);
}

async function deleteIdentity({ params: { identityType } }, res, { keysRepository, author }) {
  const keyPath = schemaPrefix + identityType;
  await keysRepository.deleteKey(keyPath, author);
  res.sendStatus(200);
}

async function addIdentity({ params: { identityType } }, res, { keysRepository, author }) {
  const key = schemaPrefix + identityType;
  const manifest = {
    key_path: key,
    meta: {
      name: key,
      description: `The schema of a ${identityType}`,
      tags: [],
      readOnly: false,
      archived: false,
    },
    implementation: {
      type: 'const',
      value: req.body,
    },
    valueType: 'object',
    enabled: true,
    dependencies: [],
  };
  await keysRepository.updateKey(key, manifest, null, author);
  res.sendStatus(200);
}

async function patchIdentity({ params: { identityType } }, res, { keysRepository, author }) {
  try {
    const patch = req.body;
    const key = schemaPrefix + identityType;
    const manifest = await keysRepository.getKeyManifest(key);
    const newManifest = R.assocPath(
      ['implementation', 'value'],
      jsondiffpatch.patch(manifest.implementation.value, patch),
    )(manifest);
    await keysRepository.updateKey(key, newManifest, null, author);
    res.sendStatus(200);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(500);
  }
}

module.exports = {
  getSchemas,
  deleteIdentity,
  addIdentity,
  patchIdentity,
};
