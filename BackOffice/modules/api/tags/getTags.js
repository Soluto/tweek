export default function (req, res, { tagsRepository }) {
  tagsRepository.getTags().then(res.json.bind(res), (ex) => console.error(ex));
}
