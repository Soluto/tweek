import { UKNOWN_AUTHOR } from './unknownAuthor';
import jsondiffpatch from 'jsondiffpatch';
import R from 'ramda';
import changeCase from 'change-case';

function getAuthor(req) {
  return (
    (req.user &&
    req.user.email && {
      name: req.user.displayName || req.user.email,
      email: req.user.email,
    }) ||
    UKNOWN_AUTHOR
  );
}

export async function getSchemas(req, res, { keysRepository }) {
  const prefix = `@tweek/schema`;
  const manifests = await keysRepository.getAllManifests(prefix);
  const schemas = manifests.reduce(
    (acc, m) => ({ ...acc, [m.key_path.substring(prefix.length + 1)]: m.implementation.value }),
    {},
  );
  res.json(schemas);
}

export async function patchIdentity(req, res, { keysRepository }, { params: { identityName } }) {
  try {
    const author = getAuthor(req);
    const patch = req.body;
    console.log(patch);
    const key = `@tweek/schema/${identityName}`;
    const manifest = await keysRepository.getKeyManifest(key);
    console.log(manifest);
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
