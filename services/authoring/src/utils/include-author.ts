export default function includeAuthor(handler) {
  return (req, res, config = {}) => {
    const { 'author.name': name, 'author.email': email } = req.query;

    if (req.method.toLowerCase() !== 'get' && (!name || !email)) {
      res.status(400).send('Missing name and/or email');
      return;
    }

    const author = { name: name || 'unknown', email: email || 'unknown@tweek.com' };

    return handler(req, res, Object.assign({ author }, config));
  };
}
