import changeCase from "change-case";
import R from 'ramda';
import authenticatedClient from '../server/auth/authenticatedClient';

const mapKeys = R.curry((fn, obj) =>
  R.fromPairs(R.map(R.adjust(fn, 0), R.toPairs(obj))));

export async function getContextSchema(req, res, {tweekApiHostname}) {
  const tweekApiClient = await authenticatedClient({baseURL: tweekApiHostname});
  const response = await tweekApiClient.get('/api/v1/keys/@tweek/context/_?$ignoreKeyTypes=false');
  const schemaDetails = response.data;
  const processedSchemaDetails = {};

  for (let identity of Object.keys(schemaDetails)) {
    processedSchemaDetails[identity] = mapKeys(changeCase.pascalCase, schemaDetails[identity]);
  }

  res.json(processedSchemaDetails);
}
