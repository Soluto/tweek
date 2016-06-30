import promisify from 'promisify-node';
let fs = promisify('fs');
import path from 'path';

export default async function (req, res, { repo }, { params, location, route }) {
  const keyPath = params.splat;
  await repo.updateRule(keyPath, req.body.ruleDef.source);
  res.send("OK");
}
