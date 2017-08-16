import R = require('ramda');
import searchIndex from '../search-index';

async function getAllKeys(req, res) {
  const manifests = await searchIndex.manifests;
  const keys = manifests.map(R.prop('key_path'));
  res.json(keys);
}

async function getAllManifests(req, res) {
  res.json(await searchIndex.manifests);
}

async function getKey(req, res, { keysRepository }) {
  const keyPath = req.params[0];
  const revision = req.query.revision;
  try {
    const keyDetails = await keysRepository.getKeyDetails(keyPath, { revision });
    res.json(keyDetails);
  } catch (exp) {
    res.sendStatus(404);
  }
}

async function getManifest(req, res, { keysRepository }) {
  const keyPath = req.params[0];
  const revision = req.query.revision;
  try {
    const manifest = await keysRepository.getKeyManifest(keyPath, { revision });
    res.json(manifest);
  } catch (exp) {
    res.sendStatus(404);
  }
}

async function getDependents(req, res) {
  const keyPath = req.params[0];
  const dependents = await searchIndex.dependents(keyPath);

  res.json(dependents);
}

async function getKeyRevisionHistory(req, res, { keysRepository }) {
  const keyPath = req.params[0];
  const { since } = req.query;
  const revisionHistory = await keysRepository.getKeyRevisionHistory(keyPath, { since });
  res.json(revisionHistory);
}

async function updateKey(req, res, { keysRepository, author }) {
  const keyPath = req.params[0];

  const implementation = req.body.implementation;
  const manifest = Object.assign({ key_path: keyPath }, req.body.manifest);
  await keysRepository.updateKey(keyPath, manifest, implementation, author);

  res.send('OK');
}

async function deleteKey(req, res, { keysRepository, author }) {
  const keyPath = req.params[0];
  await keysRepository.deleteKey(keyPath, author);

  res.send('OK');
}

async function getRevision(req, res, { keysRepository }) {
  const commit = await keysRepository.getRevision();
  res.json(commit.sha());
}

export default {
  getAllKeys,
  getAllManifests,
  getKey,
  getManifest,
  getDependents,
  getKeyRevisionHistory,
  updateKey,
  deleteKey,
  getRevision,
};
