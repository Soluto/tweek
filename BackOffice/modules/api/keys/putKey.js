import { UKNOWN_AUTHOR } from '../unknownAuthor';

export default async function (req, res,
  { metaRepository,
    keysRepository,
    author = UKNOWN_AUTHOR }, { params }) {
  const keyPath = params.splat;
  await keysRepository.updateKey(keyPath, req.body.keyDef.source, author);
  await metaRepository.updateRuleMeta(keyPath, req.body.meta, author);

  res.send('OK');
}
