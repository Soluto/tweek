import promisify from 'promisify-node';
let fs = promisify('fs');
import path from 'path';

export default async function (req, res, { metaRepository, rulesRepository, author = { name: 'unknown', email: 'unknown@tweek.com' } }, { params, location, route }) {
  const keyPath = params.splat;
  await rulesRepository.updateRule(keyPath, req.body.ruleDef.source, author);
  await metaRepository.updateRuleMeta(keyPath, req.body.meta, author);
  res.send('OK');
}
