import { UKNOWN_AUTHOR } from './unknownAuthor';

export async function getTags(req, res, { tagsRepository }) {
  const tags = await tagsRepository.getTags();
  res.json(tags);
}

export async function saveTags(req, res, { tagsRepository, author = UKNOWN_AUTHOR }) {
  const tagsToSave = req.body;

  await tagsRepository.mergeTags(tagsToSave, author);
  res.send('OK');
}
