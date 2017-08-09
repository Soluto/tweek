async function getTags(req, res, { tagsRepository }) {
  const tags = await tagsRepository.getTags();
  res.json(tags);
}

async function saveTags(req, res, { tagsRepository, author }) {
  const tagsToSave = req.body;
  await tagsRepository.mergeTags(tagsToSave, author);
  res.sendStatus(200);
}

module.exports = {
  getTags,
  saveTags,
};
