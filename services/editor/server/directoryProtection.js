const addDirectoryTraversalProtection = (server) => {
  const DANGEROUS_PATH_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
  server.use('*', (req, res, next) => {
    if (req.path.includes('\0') || DANGEROUS_PATH_PATTERN.test(req.path)) {
      return res.status(400).send({ error: 'Dangerous path' });
    }
    return next();
  });
};

export default addDirectoryTraversalProtection;
