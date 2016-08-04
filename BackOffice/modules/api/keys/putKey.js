import promisify from 'promisify-node';
let fs = promisify('fs');
import path from 'path';

export default async function (req, res,
  { metaRepository,
    rulesRepository,
    tagsRepository,
    author = { name: 'unknown', email: 'unknown@tweek.com' } }, { params }) {
  const keyPath = params.splat;
  await rulesRepository.updateRule(keyPath, req.body.ruleDef.source, author);
  await metaRepository.updateRuleMeta(keyPath, req.body.meta, author);
  await tagsRepository.mergeNewTags(req.body.meta.tags.map(x => ({ name: x })), author);

  res.send('OK');
}
