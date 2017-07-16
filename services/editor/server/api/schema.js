import jsondiffpatch from 'jsondiffpatch';
import R from 'ramda';
import searchIndex from '../searchIndex';
import { getAuthor } from './utils/author';

export async function getSchemas(req, res) {
  const prefix = `@tweek/schema/`;
  const allManifests = await searchIndex.manifests;
  const schemaManifests = allManifests.filter(m => m.key_path.startsWith(prefix));
  const schemas = schemaManifests.reduce(
    (acc, m) => ({ ...acc, [m.key_path.substring(prefix.length)]: m.implementation.value }),
    {},
  );

  res.json(schemas);
}

export async function deleteIdentity(
  req,
  res,
  { keysRepository, author = getAuthor(req) },
  { params: { identityType } },
) {
  const keyPath = `@tweek/schema/${identityType}`;
  await keysRepository.deleteKey(keyPath, author);
  res.sendStatus(200);
}

export async function addIdentity(
  req,
  res,
  { keysRepository, author = getAuthor(req) },
  { params: { identityType } },
) {
  const key = `@tweek/schema/${identityType}`;
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

export async function patchIdentity(
  req,
  res,
  { keysRepository, author = getAuthor(req) },
  { params: { identityType } },
) {
  try {
    const patch = req.body;
    const key = `@tweek/schema/${identityType}`;
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
