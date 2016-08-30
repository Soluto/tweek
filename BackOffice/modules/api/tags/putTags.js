import { UKNOWN_AUTHOR } from '../unknownAuthor';

export default async function (req, res, { tagsRepository, author = UKNOWN_AUTHOR }) {
  const tagsToSave = req.body;
  await tagsRepository.mergeNewTags(tagsToSave.map(x => ({ name: x })), author);

  res.send('OK');
}
