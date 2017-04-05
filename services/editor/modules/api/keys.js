import { UKNOWN_AUTHOR } from './unknownAuthor';


let injectAuthor = (fn) => function (req, res, deps, ...rest) {
  return this::fn(req, res, {
    author: (req.user && req.user.email && {
      name: req.user.displayName || req.user.email,
      email: req.user.email
    }) || UKNOWN_AUTHOR,
    ...deps
  }, ...rest);
}

export async function getKey(req, res, { keysRepository }, { params }) {
  const keyPath = params.splat;
  const revision = req.query.revision;
  let keyDetails;
  try {
    keyDetails = await keysRepository.getKeyDetails(keyPath, { revision });
  } catch (exp) {
    res.sendStatus(404);
  }

  res.json(keyDetails);
}

export const saveKey = injectAuthor(async function (req, res, { keysRepository, author }, { params }) {
  const keyPath = params.splat;

  let keyRulesSource = req.body.keyDef.source;
  let keyMetaSource = JSON.stringify(req.body.meta, null, 4);
  await keysRepository.updateKey(keyPath, keyMetaSource, keyRulesSource, author);

  res.send('OK');
})

export const deleteKey = injectAuthor(async function (req, res, { keysRepository, author }, { params }) {
  const keyPath = params.splat;
  await keysRepository.deleteKey(keyPath, author);
  res.send('OK');
})