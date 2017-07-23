function includeAuthor(handler) {
  return (req, res, config = {}) => {
    const { user, email } = req.query;

    if (req.method.toLowerCase() !== 'get' && (!user || !email)) {
      res.status(400).send("Missing user and/or email");
      return;
    }

    const author = { user: user || 'unknown', email: email || 'unknown@tweek.com' };

    return handler(req, res, Object.assign({ author }, config));
  };
}

module.exports = includeAuthor;
