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
    let author = getAuthor(req);
    let patch = req.body;
    let prefix = `@tweek/context/${identityName}/`;

    const manifests = await keysRepository.getAllManifests(prefix);
    let propManifestIndex = R.indexBy(x =>
      changeCase.pascalCase(x.key_path.substring(prefix.length)),
    )(manifests);
    let valueDefintion = R.map(manifest => manifest.implementation.value)(propManifestIndex);
    let newDefintion = jsondiffpatch.patch(valueDefintion, patch);

    R.toPairs(newDefintion).map(async ([propName, value]) => {
      let newManifest = R.assocPath(['implementation', 'value'], value)(
        propManifestIndex[propName],
      );
      let manifestPath = `${prefix}${changeCase.snakeCase(propName)}`;
      await keysRepository.updateKey(manifestPath, JSON.stringify(newManifest), null, author);
    });
    res.sendStatus(200);
  } catch (ex) {
    console.log(ex);
    res.sendStatus(404);
  }
}
