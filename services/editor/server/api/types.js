import authenticatedClient from '../auth/authenticatedClient';

export async function getTypes(req, res, { tweekApiHostname }) {
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });
  const response = await tweekApiClient.get(
    '/api/v1/keys/@tweek/custom_types/_?$ignoreKeyTypes=false',
  );
  res.json(response.data);
}
