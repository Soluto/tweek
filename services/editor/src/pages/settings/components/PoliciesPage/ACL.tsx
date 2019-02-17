import React from 'react';
import { Validator } from 'jsonschema';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import jsonSchema from './acl-schema.json';
import RemoteCodeEditor from './RemoteCodeEditor';

const schemaValidator = new Validator();
const isValidJson = (data: string) => {
  try {
    const result = JSON.parse(data);
    return schemaValidator.validate(result, jsonSchema).valid;
  } catch (ex) {
    return false;
  }
};

export default function() {
  return (
    <RemoteCodeEditor
      language="json"
      label="acl policies"
      reader={async () => JSON.stringify(await tweekManagementClient.getPolicies(), null, 4)}
      writer={(policies) => tweekManagementClient.savePolicies(JSON.parse(policies))}
      validate={isValidJson}
      monacoProps={{
        editorWillMount: (monaco) => {
          monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
              {
                uri: 'http://tweek/policies',
                fileMatch: ['*'],
                schema: jsonSchema,
              },
            ],
          });
        },
      }}
    />
  );
}
