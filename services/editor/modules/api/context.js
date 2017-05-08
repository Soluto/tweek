import changeCase from 'change-case';
import R from 'ramda';
import authenticatedClient from '../server/auth/authenticatedClient';

const mapKeys = R.curry((fn, obj) =>
  R.fromPairs(R.map(R.adjust(fn, 0), R.toPairs(obj))));

export async function getContextSchema(req, res, { tweekApiHostname }) {
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });
  const response = await tweekApiClient.get('/api/v1/keys/@tweek/context/_?$ignoreKeyTypes=false');
  const schemaDetails = response.data;
  const processedSchemaDetails =
    Object.keys(schemaDetails)
      .reduce((result, identity) => ({
        ...result,
        [identity]: mapKeys(changeCase.pascalCase, schemaDetails[identity]),
      }), {});

  res.json(processedSchemaDetails);
}

export async function getContext(req, res, { tweekApiHostname }, { params }) {
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });
  const response = await tweekApiClient.get(`api/v1/context/${params.contextType}/${encodeURIComponent(params.contextId)}`);
  res.json(response.data);
}

export async function updateContext(req, res, { tweekApiHostname }, { params }) {
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });
  await tweekApiClient.post(`api/v1/context/${params.contextType}/${encodeURIComponent(params.contextId)}`, req.body);
  res.sendStatus(200);
}

export async function deleteContextKey(req, res, { tweekApiHostname }, { params }) {
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });
  await tweekApiClient.delete(`api/v1/context/${params.contextType}/${encodeURIComponent(params.contextId)}/${params.key}`);
  res.sendStatus(200);
}
