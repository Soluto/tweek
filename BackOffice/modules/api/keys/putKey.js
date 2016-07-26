import promisify from 'promisify-node';
let fs = promisify('fs');
import path from 'path';

export default async function (req, res, { metaRepository, rulesRepository }, { params, location, route }) {
  const keyPath = params.splat;
  await rulesRepository.updateRule(keyPath, req.body.ruleDef.source);
  await metaRepository.updateRuleMeta(keyPath, req.body.meta);
  res.send('OK');
}
