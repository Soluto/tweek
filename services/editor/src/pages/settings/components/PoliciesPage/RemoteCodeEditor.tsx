import React from 'react';
import { useRemoteState, useErrorNotifier } from './utils';
import { FetchError } from 'tweek-client';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import MonacoEditor, { MonacoEditorProps } from 'react-monaco-editor';
import { useState } from 'react';

type RemoteCodeEditorPropTypes = {
  reader: () => Promise<string>;
  writer: (data: string) => Promise<void>;
  label: string;
  language: string;
  validate?: (data: string) => boolean;
  monacoProps?: MonacoEditorProps;
};

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

export default function RemoteCodeEditor({
  reader,
  writer,
  label,
  language,
  validate = (_) => true,
  monacoProps = {},
}: RemoteCodeEditorPropTypes) {
  const [code, setCode, remote] = useRemoteState(reader, writer);
  const [isValid, setIsValid] = useState(true);

  useErrorNotifier(remote.loadingState === 'idle' ? remote.error : null, `Error saving ${label}`);

  if (remote.loadingState === 'loading' && !code) return null;
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
        isValid={isValid}
        isSaving={remote.loadingState === 'saving'}
        hasChanges={remote.isDirty}
        onClick={() => remote.save()}
      />
      <MonacoEditor
        language={language}
        options={monacoOptions}
        {...monacoProps}
        value={code}
        onChange={(newSource: string) => {
          setIsValid(validate(newSource));
          setCode(newSource);
        }}
      />
    </>
  );
}
