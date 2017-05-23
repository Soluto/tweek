import { UKNOWN_AUTHOR } from './unknownAuthor';
import R from 'ramda';
import {convertMetaToNewFormat} from '../utils/meta-legacy';

let injectAuthor = (fn) => function (req, res, deps, ...rest) {
  return this::fn(req, res, {
    author: (req.user && req.user.email && {
      name: req.user.displayName || req.user.email,
      email: req.user.email
    }) || UKNOWN_AUTHOR,
    ...deps
  }, ...rest);
};

export async function getKey(req, res, { keysRepository }, { params }) {
  const keyPath = params.splat;
  const revision = req.query.revision;
  try {
    const keyDetails = await keysRepository.getKeyDetails(keyPath, { revision });
    res.json({...keyDetails, meta: convertMetaToNewFormat(keyPath, keyDetails)});
  } catch (exp) {
    res.sendStatus(404);
  }
}

export async function getKeyMeta(req, res, { keysRepository }, { params }) {
  const keyPath = params.splat;
  const revision = req.query.revision;
  try {
    const meta = await keysRepository.getKeyMeta(keyPath, { revision });
    res.json(meta);
  } catch (exp) {
    res.sendStatus(404);
  }
}

export const saveKey = injectAuthor(async function (req, res, { keysRepository, author }, { params }) {
  const keyPath = params.splat;

  const keyRulesSource = req.body.keyDef.source;
  const meta = { key_path: keyPath, ...req.body.meta };
  const keyMetaSource = JSON.stringify(meta, null, 4);
  await keysRepository.updateKey(keyPath, keyMetaSource, keyRulesSource, author);

  res.send('OK');
});

export const deleteKey = injectAuthor(async function (req, res, { keysRepository, author }, { params }) {
  const keyPath = params.splat;
  await keysRepository.deleteKey(keyPath, author);
  res.send('OK');
});