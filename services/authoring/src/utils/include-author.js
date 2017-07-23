function includeAuthor(isAuthorRequired) {
  return function (handler) {
    return (req, res, config = {}) => {
      const { user, email } = req.query;

      if (isAuthorRequired && (!user || !email)) {
        res.status(400).send("Missing user and/or email");
        return;
      }

      const author = { user: user || 'unknown', email: email || 'unknown@tweek.com' };

      return handler(req, res, Object.assign({}, config, { author }));
    };
  };
}

module.exports = includeAuthor;
