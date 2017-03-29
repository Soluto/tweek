import changeCase from "change-case";
import R from 'ramda';

const mapKeys = R.curry((fn, obj) =>
  R.fromPairs(R.map(R.adjust(fn, 0), R.toPairs(obj))));

export async function getContextSchema(req, res, {tweekApiHostname}) {

  let response = await fetch(`${tweekApiHostname}/configurations/@tweek/context/_?$ignoreKeyTypes=false`);
  let schemaDetails = await response.json();
  let processedSchemaDetails = {};

  for (let identity of Object.keys(schemaDetails)) {
    processedSchemaDetails[identity] = mapKeys(changeCase.pascalCase, schemaDetails[identity]);
    //processedSchemaDetails[identity] = {...mapKeys(changeCase.pascalCase, schemaDetails[identity]), "@@Id": {type:"string"}, "@CreationDate": {type:"date"}};
  }

  res.json(processedSchemaDetails);
}
