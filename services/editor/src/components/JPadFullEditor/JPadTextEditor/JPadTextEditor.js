import React from 'react';
import {
  compose,
  setDisplayName,
  defaultProps,
  mapProps,
  withState,
  withHandlers,
  setPropTypes,
} from 'recompose';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';
import { AutoSizer } from 'react-virtualized';
import './JPadTextEditor.css';

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

const JPadTextEditor = compose(
  setDisplayName('JPadTextEditor'),
  setPropTypes({
    source: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isReadonly: PropTypes.bool,
    setHasChanges: PropTypes.func,
  }),
  defaultProps({
    isReadonly: false,
    setHasUnsavedChanges: () => {},
  }),
  mapProps(({ source, ...props }) => ({ parsedSource: JSON.parse(source), ...props })),
  withState('currentSource', 'updateCurrentSource', ({ parsedSource }) =>
    JSON.stringify(parsedSource, null, 4),
  ),
  withHandlers({
    onChange: ({ updateCurrentSource, onChange, setHasUnsavedChanges, parsedSource }) => (
      newSource,
    ) => {
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
    },
  }),
)(({ currentSource, onChange, isReadonly }) => (
  <AutoSizer disableWidth>
    {({ height }) => (
      <div style={{ height: height - 20 }}>
        <MonacoEditor
          language="json"
          value={currentSource}
          options={{ ...monacoOptions, readOnly: isReadonly }}
          onChange={(_, newSource) => onChange(newSource)}
        />
      </div>
    )}
  </AutoSizer>
));

export default JPadTextEditor;
