import React from 'react';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import RemoteCodeEditor from '../../../../components/RemoteCodeEditor';

export default function JWTPolicyEditor() {
  return (
    <RemoteCodeEditor
      language="rego"
      label="jwt-policy"
      reader={() => tweekManagementClient.getJWTExtractionPolicy()}
      writer={(x) => tweekManagementClient.saveJWTExtractionPolicy(x)}
    />
  );
}
