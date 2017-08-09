const R = require('ramda');
const jsonpatch = require('fast-json-patch');
const searchIndex = require('../search-index');

const schemaPrefix = '@tweek/schema/';
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

async function deleteIdentity(req, res, { keysRepository, author }) {
  const { params: { identityType } } = req;

  const keyPath = schemaPrefix + identityType;
  await keysRepository.deleteKey(keyPath, author);
  res.sendStatus(200);
}

async function addIdentity(req, res, { keysRepository, author }) {
  const { params: { identityType }, body: value } = req;

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
      value,
    },
    valueType: 'object',
    enabled: true,
    dependencies: [],
  };
  await keysRepository.updateKey(key, manifest, null, author);
  res.sendStatus(200);
}

async function patchIdentity(req, res, { keysRepository, author }) {
  const { params: { identityType }, body: patch } = req;
  const key = schemaPrefix + identityType;
  const manifest = await keysRepository.getKeyManifest(key);
  const newManifest = R.assocPath(
    ['implementation', 'value'],
    jsonpatch.applyPatch(R.clone(manifest.implementation.value), patch).newDocument,
  )(manifest);
  await keysRepository.updateKey(key, newManifest, null, author);
  res.sendStatus(200);
}

module.exports = {
  getSchemas,
  deleteIdentity,
  addIdentity,
  patchIdentity,
};
