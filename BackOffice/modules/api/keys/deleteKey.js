import promisify from 'promisify-node';
let fs = promisify('fs');
import path from 'path';

export default async function (req, res,
  { metaRepository,
    rulesRepository,
    author = { name: 'unknown', email: 'unknown@tweek.com' } }, { params }) {
  const keyPath = params.splat;
  await rulesRepository.deleteKey(keyPath, author);
  await metaRepository.deleteKeyMeta(keyPath, author);

  res.send('OK');
}
