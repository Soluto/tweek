import jsondiffpatch from 'jsondiffpatch';
import R from 'ramda';
import changeCase from 'change-case';
import { getAuthor } from './utils/author';

export async function getSchemas(req, res, { keysRepository }) {
  const prefix = `@tweek/schema/`;
  const manifests = await keysRepository.getAllManifests(prefix);
  const schemas = manifests.reduce(
    (acc, m) => ({ ...acc, [m.key_path.substring(prefix.length + 1)]: m.implementation.value }),
    {},
  );
  res.json(schemas);
}

export async function patchIdentity(
  req,
  res,
  { keysRepository, author = getAuthor(req) },
  { params: { identityName } },
) {
  try {
    const patch = req.body;
    const key = `@tweek/schema/${identityName}`;
    const manifest = await keysRepository.getKeyManifest(key);
    const newManifest = R.assocPath(
      ['implementation', 'value'],
      jsondiffpatch.patch(manifest.implementation.value, patch),
    )(manifest);
    await keysRepository.updateKey(key, newManifest, null, author);
    res.sendStatus(200);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(404);
  }
}
