export default function requestErrorHandlingWrapper(handler) {
  return async (req, res, ...params) => {
    try {
      await Promise.resolve(handler(req, res, ...params));
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  };
}
