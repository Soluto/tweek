import { UKNOWN_AUTHOR } from '../unknownAuthor';

export default async function (req, res,
  { metaRepository,
    keysRepository,
    author = UKNOWN_AUTHOR }, { params }) {
  const keyPath = params.splat;
  await keysRepository.deleteKey(keyPath, author);
  await metaRepository.deleteKeyMeta(keyPath, author);

  res.send('OK');
}
