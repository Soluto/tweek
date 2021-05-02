import MonacoEditor from '@monaco-editor/react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import React, { useState } from 'react';
import { AutoSizer } from 'react-virtualized';
import './JPadTextEditor.css';

const monacoOptions = {
  autoIndent: 'full' as const,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
};

const noop = () => {};

export type JPadTextEditorProps = {
  source: string;
  onChange: (source: string) => void;
  isReadonly?: boolean;
  setHasUnsavedChanges?: (hasChanges: boolean) => void;
};

const JPadTextEditor = ({
  source,
  onChange,
  isReadonly = false,
  setHasUnsavedChanges = noop,
}: JPadTextEditorProps) => {
  const parsedSource = JSON.parse(source);
  const [currentSource, updateCurrentSource] = useState(() =>
    JSON.stringify(parsedSource, null, 4),
  );

  const onSourceChanged = (newSource: string | undefined) => {
    if (newSource == null) {
      newSource = '';
    }

    updateCurrentSource(newSource);
    try {
      const newParsedSource = JSON.parse(newSource);
      if (!R.equals(newParsedSource, parsedSource)) {
        onChange(newSource);
      }
      setHasUnsavedChanges(false);
    } catch (e) {
      setHasUnsavedChanges(true);
    }
  };

  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <div style={{ height: height - 20 }}>
          <MonacoEditor
            language="json"
            value={currentSource}
            options={{ ...monacoOptions, readOnly: isReadonly }}
            onChange={onSourceChanged}
          />
        </div>
      )}
    </AutoSizer>
  );
};

JPadTextEditor.propTypes = {
  source: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isReadonly: PropTypes.bool,
  setHasUnsavedChanges: PropTypes.func,
};

export default JPadTextEditor;
