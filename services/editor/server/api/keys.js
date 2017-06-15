import { convertMetaToNewFormat } from '../utils/meta-legacy';
import { UKNOWN_AUTHOR } from './unknownAuthor';

let injectAuthor = fn =>
  function (req, res, deps, ...rest) {
    return this::fn(
      req,
      res,
      {
        author:
          (req.user &&
          req.user.email && {
            name: req.user.displayName || req.user.email,
            email: req.user.email,
          }) ||
            UKNOWN_AUTHOR,
        ...deps,
      },
      ...rest,
    );
  };

export async function getAllKeys(req, res, { keysRepository }) {
  const keys = await keysRepository.getAllKeys();
  res.json(keys);
}

export async function getAllManifests(req, res, { keysRepository }) {
  const manifests = await keysRepository.getAllManifests();
  res.json(manifests);
}

export async function getKey(req, res, { keysRepository }, { params }) {
  const keyPath = params[0];
  const revision = req.query.revision;
  try {
    const keyDetails = await keysRepository.getKeyDetails(keyPath, { revision });
    res.json({ ...keyDetails, manifest: convertMetaToNewFormat(keyPath, keyDetails) });
  } catch (exp) {
    res.sendStatus(404);
  }
}

export async function getKeyManifest(req, res, { keysRepository }, { params }) {
  const keyPath = params[0];
  const revision = req.query.revision;
  try {
    const manifest = await keysRepository.getKeyManifest(keyPath, { revision });
    res.json(manifest);
  } catch (exp) {
    res.sendStatus(404);
  }
}

export const saveKey = injectAuthor(async (req, res, { keysRepository, author }, { params }) => {
  const keyPath = params[0];

  const keyRulesSource = req.body.keyDef.source;
  const manifest = { key_path: keyPath, ...req.body.manifest };
  await keysRepository.updateKey(keyPath, manifest, keyRulesSource, author);

  res.send('OK');
});

export const deleteKey = injectAuthor(async (req, res, { keysRepository, author }, { params }) => {
  const keyPath = params[0];
  await keysRepository.deleteKey(keyPath, author);
  res.send('OK');
});
