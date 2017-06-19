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

export async function patchIdentity(req, res, { keysRepository }, { params: { identityName } }) {
  try {
    const author = getAuthor(req);
    const patch = req.body;
    const prefix = `@tweek/context/${identityName}`;
    const manifests = await keysRepository.getAllManifests(prefix);
    const propManifestIndex = R.indexBy(x =>
      changeCase.pascalCase(x.key_path.substring(`${prefix}/`.length)),
    )(manifests);
    const valueDefintion = R.map(manifest => R.clone(manifest.implementation.value))(
      propManifestIndex,
    );
    const newDefintion = jsondiffpatch.patch(valueDefintion, patch);

    const updates = R.toPairs(newDefintion)
      .filter(
        ([propName, value]) => !R.equals(propManifestIndex[propName].implementation.value, value),
      )
      .map(([propName, value]) => {
        const manifest = propManifestIndex[propName]
          ? R.assocPath(['implementation', 'value'], value)(propManifestIndex[propName])
          : generateSchemaManifest(propName, value);

        const keyPath = `${prefix}/${changeCase.snakeCase(propName)}`;
        return { keyPath, manifest };
      });
    console.log('updates', updates);

    await keysRepository.bulkUpdate(updates, `update schema: ${identityName}`, author);
    res.sendStatus(200);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(404);
  }
}
