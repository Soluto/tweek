import jsonpatch from 'fast-json-patch';
import * as R from 'ramda';
import authenticatedClient from '../auth/authenticatedClient';

export async function getContext(req, res, { serviceEndpoints: { api: apiAddress } }, { params }) {
  const tweekApiClient = await authenticatedClient({ baseURL: apiAddress });
  const response = await tweekApiClient.get(
    `api/v1/context/${params.identityType}/${encodeURIComponent(params.identityId)}`,
  );
  res.json(response.data);
}

const getDeletedKeys = R.pipe(R.unapply(R.map(R.keys)), R.apply(R.difference));

const getModifiedKeys = R.pipe(R.unapply(R.map(R.toPairs)), R.apply(R.difference), R.pluck(0));

export async function updateContext(
  req,
  res,
  { serviceEndpoints: { api: apiAddress } },
  { params },
) {
  const tweekApiClient = await authenticatedClient({ baseURL: apiAddress });

  const contextUrl = `api/v1/context/${params.identityType}/${encodeURIComponent(
    params.identityId,
  )}`;

  const patch = req.body;

  const response = await tweekApiClient.get(contextUrl);
  const currentContext = response.data;
  const newContext = jsonpatch.applyPatch(R.clone(currentContext), patch).newDocument;

  const keysToDelete = getDeletedKeys(currentContext, newContext);
  const deleteKeys = keysToDelete.map(key => tweekApiClient.delete(`${contextUrl}/${key}`));

  const modifiedKeys = getModifiedKeys(newContext, currentContext);

  if (modifiedKeys.length > 0) {
    await tweekApiClient.post(contextUrl, R.pickAll(modifiedKeys, newContext));
  }

  await Promise.all(deleteKeys);

  res.sendStatus(200);
}
