import searchIndex from '../searchIndex';
import { convertMetaToNewFormat } from '../utils/meta-legacy';
import { getAuthor } from './utils/author';

export async function getAllKeys(req, res, { keysRepository }) {
  const keys = await keysRepository.getAllKeys();
  res.json(keys);
}

export async function getAllManifests(req, res) {
  res.json(await searchIndex.manifests);
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

export async function getDependents(req, res, { keysRepository }, { params }) {
  const keyPath = params[0];
  const dependents = await searchIndex.dependents(keyPath);

  res.json(dependents);
}

export async function getKeyRevisionHistory(req, res, { keysRepository }, { params }) {
  const keyPath = params[0];
  const revisionHistory = await keysRepository.getKeyRevisionHistory(keyPath);
  res.json(revisionHistory);
}

export const saveKey = async (
  req,
  res,
  { keysRepository, author = getAuthor(req) },
  { params },
) => {
  const keyPath = params[0];

  const keyRulesSource = req.body.keyDef.source;
  const manifest = { key_path: keyPath, ...req.body.manifest };
  await keysRepository.updateKey(keyPath, manifest, keyRulesSource, author);

  res.send('OK');
};

export const deleteKey = async (
  req,
  res,
  { keysRepository, author = getAuthor(req) },
  { params },
) => {
  const keyPath = params[0];
  await keysRepository.deleteKey(keyPath, author);
  res.send('OK');
};

export async function getRevision(req, res, { keysRepository }) {
  const commit = await keysRepository.getRevision();
  res.json(commit.sha());
}
