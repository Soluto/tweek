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

  const response = await tweekApiClient.get(contextUrl);
  const currentContext = response.data;
  const newContext = req.body;

  const deletedKeys = Object.keys(currentContext)
    .filter(key => key.includes('@fixed:'))
    .filter(key => !newContext.hasOwnProperty(key))
    .map(key => tweekApiClient.delete(`${contextUrl}/${key}`));

  await Promise.all([...deletedKeys, tweekApiClient.post(contextUrl, newContext)]);

  res.sendStatus(200);
}
