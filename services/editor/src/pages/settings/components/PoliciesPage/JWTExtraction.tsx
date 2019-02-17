import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import { useRemoteState, useErrorNotifier } from './utils';
import { FetchError } from 'tweek-client';

const monacoOptions = {
  autoIndent: true,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
};

export default function() {
  const [policy, setPolicy, remote] = useRemoteState(
    () => tweekManagementClient.getJWTExtractionPolicy(),
    (policy) => tweekManagementClient.updateJWTExtractionPolicy(policy),
  );
  useErrorNotifier(remote.loadingState === 'idle' ? remote.error : null, 'Error saving jwt-policy');

  if (remote.loadingState === 'loading' && !policy) return null;
  if (remote.error && remote.loadingState === 'error') {
    const error = remote.error;
    return (
      <div>
        Error:{' '}
        {error instanceof FetchError
          ? `${error.response.status}: ${error.response.statusText}`
          : error.message}
      </div>
    );
  }

  return (
    <>
      <SaveButton
        isValid={true}
        isSaving={remote.loadingState === 'saving'}
        hasChanges={remote.isDirty}
        onClick={() => remote.save()}
      />
      <MonacoEditor
        language="rego"
        options={monacoOptions}
        value={policy}
        onChange={(newSource: string) => {
          setPolicy(newSource);
        }}
      />
    </>
  );
}
