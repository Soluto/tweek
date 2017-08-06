import jsonpatch from 'fast-json-patch';
import R from 'ramda';
import authenticatedClient from '../auth/authenticatedClient';

export async function getContext(req, res, { tweekApiHostname }, { params }) {
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });
  const response = await tweekApiClient.get(
    `api/v1/context/${params.identityName}/${encodeURIComponent(params.identityId)}`,
  );
  res.json(response.data);
}

export async function updateContext(req, res, { tweekApiHostname }, { params }) {
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });

  const contextUrl = `api/v1/context/${params.identityName}/${encodeURIComponent(
    params.identityId,
  )}`;

  const patch = req.body;
  const keysToModify = patch.map(({ op, path }) => ({
    op,
    key: path.replace(/^\//, '').replace(/~1/g, '/'),
  }));

  const deletedKeys = keysToModify
    .filter(({ op }) => op === 'move' || op === 'remove')
    .map(({ key }) => tweekApiClient.delete(`${contextUrl}/${key}`));

  const modifiedKeys = keysToModify.filter(({ op }) => op !== 'remove').map(({ key }) => key);

  if (modifiedKeys.length > 0) {
    const response = await tweekApiClient.get(contextUrl);

    const currentContext = R.pickAll(modifiedKeys, response.data);
    const newContext = jsonpatch.applyPatch(currentContext, patch).newDocument;

    await tweekApiClient.post(contextUrl, newContext);
  }

  await Promise.all(deletedKeys);

  res.sendStatus(200);
}
