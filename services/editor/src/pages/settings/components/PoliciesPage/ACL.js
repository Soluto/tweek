import React from 'react';
import { Validator } from 'jsonschema';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import jsonSchema from './acl-schema.json';
import RemoteCodeEditor from './RemoteCodeEditor';

const schemaValidator = new Validator();
const isValidJson = (data) => {
  try {
    const result = JSON.parse(data);
    return schemaValidator.validate(result, jsonSchema).valid;
  } catch (ex) {
    return false;
  }
};

export default function ACLEditor() {
  return (
    <RemoteCodeEditor
      language="json"
      label="acl policies"
      reader={async () => JSON.stringify(await tweekManagementClient.getPolicies(), null, 4)}
      writer={(policies) => tweekManagementClient.savePolicies(JSON.parse(policies))}
      validate={isValidJson}
      monacoProps={{
        editorWillMount: (monaco) => {
          try {
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
          } catch (err) {
            console.error('failed to set schema', err);
          }
        },
      }}
    />
  );
}
