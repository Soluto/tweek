import authenticatedClient from '../auth/authenticatedClient';

export async function getTypes(req, res, { serviceEndpoints: { api: apiAddress } }) {
  const tweekApiClient = await authenticatedClient({ baseURL: apiAddress });
  const response = await tweekApiClient.get('/api/v1/keys/@tweek/custom_types/_');
  res.json(response.data);
}
