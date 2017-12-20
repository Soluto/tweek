import React, { Component } from 'react';
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
import MonacoEditor from 'react-monaco-editor';
import { AutoSizer } from 'react-virtualized';
import './JPadTextEditor.css';

const requireConfig = {
  url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
  paths: {
    vs: 'https://unpkg.com/monaco-editor@0.8.2/min/vs',
  },
};

const monacoOptions = {
  autoIndent: true,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
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
    setHasChanges: () => {},
  }),
  mapProps(({ source, ...props }) => ({ parsedSource: JSON.parse(source), ...props })),
  withState('currentSource', 'updateCurrentSource', ({ parsedSource }) =>
    JSON.stringify(parsedSource, null, 4),
  ),
  withHandlers({
    onChange: ({ updateCurrentSource, onChange, setHasChanges, parsedSource }) => (newSource) => {
      updateCurrentSource(newSource);
      setHasChanges(true);
      try {
        const newParsedSource = JSON.parse(newSource);
        if (!R.equals(newParsedSource, parsedSource)) {
          onChange(newSource);
        }
        setHasChanges(false);
      } catch (e) {}
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
          onChange={newSource => onChange(newSource)}
          requireConfig={requireConfig}
        />
      </div>
    )}
  </AutoSizer>
));

export default JPadTextEditor;
