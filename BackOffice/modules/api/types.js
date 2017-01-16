export async function getTypes(req, res, { typesRepository }) {
  const tags = await typesRepository.getTypes();
  res.json(tags);
}
