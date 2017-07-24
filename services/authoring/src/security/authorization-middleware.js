function authorize({ extractPath = R.identity, permissionRequired = [] }) {
  return function (req, res, next) {
    const path = extractPath(req);
    try {
      const app = extractApp(req);
    } catch (ex) {
      res.send(403);
    }
  };
}

export { authorize };
