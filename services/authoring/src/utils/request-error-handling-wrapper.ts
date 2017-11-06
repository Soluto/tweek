export default function requestErrorHandlingWrapper(handler) {
  return async (req, res) => {
    try {
      await Promise.resolve(handler(req, res));
    } catch (err) {
      console.error(req.method, req.originalUrl, err);
      res.status(500).send(err.message || 'Internal Server Error');
    }
  };
}
