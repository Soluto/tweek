export default function requestErrorHandlingWrapper(handler, config) {
  return async (req, res) => {
    try {
      await Promise.resolve(handler(req, res, config, { params: req.params }));
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  };
}
