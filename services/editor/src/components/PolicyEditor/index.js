import * as R from 'ramda';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import MonacoEditor from 'react-monaco-editor';
import { AutoSizer } from 'react-virtualized';

export const PolicyEditor = ({ source, onChange, isReadonly, setHasUnsavedChanges }) => {
  const [updatedSource, setUpdatedSource] = useState(source);
  const onEditorChange = useCallback((newSource) => {
    setUpdatedSource(newSource);

    try {
      const parsedSource = JSON.parse(source);
      const parsedUpdatedSource = JSON.parse(updatedSource);

      if (!R.equals(parsedUpdatedSource, parsedSource)) {
        onChange(updatedSource);
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      setHasUnsavedChanges(true);
    }
  });

  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <div style={{ height: height - 20 }}>
          <MonacoEditor
            language="json"
            value={source}
            options={{
              readOnly: isReadonly,
              autoIndent: true,
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
              minimap: {
                enabled: false,
              },
            }}
            onChange={onEditorChange}
          />
        </div>
      )}
    </AutoSizer>
  );
};

PolicyEditor.propTypes = {
  source: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setHasUnsavedChanges: PropTypes.func,
};
