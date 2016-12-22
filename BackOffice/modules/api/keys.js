import { UKNOWN_AUTHOR } from './unknownAuthor';

export async function getKey(req, res, { keysRepository }, { params })
{
  const keyPath = params.splat;

  const key = await keysRepository.getKeyDetails(keyPath);
  if (!key) {
    res.sendStatus(404);
  }

  res.json(key);
}

export async function saveKey(req, res, { keysRepository, author = UKNOWN_AUTHOR }, { params })
{
  const keyPath = params.splat;

  let keyRulesSource = req.body.keyDef.source;
  let keyMetaSource = JSON.stringify(req.body.meta, null, 4);

  await keysRepository.updateKey(keyPath, keyMetaSource, keyRulesSource, author);

  res.send('OK');
}

export async function deleteKey(req, res, { keysRepository, author = UKNOWN_AUTHOR }, { params })
{
  const keyPath = params.splat;
  await keysRepository.deleteKey(keyPath, author);
  res.send('OK');
}