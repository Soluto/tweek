import { UKNOWN_AUTHOR } from '../unknownAuthor';

export default async function (req, res,
  { metaRepository,
    rulesRepository,
    author = UKNOWN_AUTHOR }, { params }) {
  const keyPath = params.splat;
  await rulesRepository.updateRule(keyPath, req.body.ruleDef.source, author);
  await metaRepository.updateRuleMeta(keyPath, req.body.meta, author);

  res.send('OK');
}
