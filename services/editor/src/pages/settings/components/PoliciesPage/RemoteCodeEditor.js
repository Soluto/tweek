import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';
import { FetchError } from 'tweek-client';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import { useRemoteState } from './utils';
import useErrorNotifier from '../../../../utils/useErrorNotifier';

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
}) {
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
        onChange={(_, newSource) => {
          setIsValid(validate(newSource));
          setCode(newSource);
        }}
      />
    </>
  );
}

RemoteCodeEditor.propTypes = {
  reader: PropTypes.func.isRequired,
  writer: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  validate: PropTypes.func,
  monacoProps: PropTypes.object,
};
