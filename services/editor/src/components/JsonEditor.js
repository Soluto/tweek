import React from 'react';
import PropTypes from 'prop-types';
import { compose, withStateHandlers, setDisplayName, setPropTypes, lifecycle } from 'recompose';
import * as R from 'ramda';
import MonacoEditor from 'react-monaco-editor';
import { AutoSizer } from 'react-virtualized';
import './JsonEditor.css';

const requireConfig = {
  url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
  paths: {
    vs: 'https://unpkg.com/monaco-editor@0.8.2/min/vs',
  },
};

const parse = str => JSON.parse(str);
const format = json => JSON.stringify(json, null, 4);

export const JsonEditor = compose(
  setDisplayName('JsonEditor'),
  setPropTypes({
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    onChange: PropTypes.func.isRequired,
    onValidationChange: PropTypes.func.isRequired,
  }),
  withStateHandlers(
    ({ value }) => {
      const text = format(value);
      return { text, isValid: true };
    },
    {
      changeText: (state, props) => (newText) => {
        const parsedObject = R.tryCatch(parse, R.F)(newText);
        return { text: newText, isValid: !!parsedObject };
      },
    },
  ),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (this.props.isValid !== nextProps.isValid) {
        this.props.onValidationChange(nextProps.isValid);
      }
      if (nextProps.isValid && this.props.text !== nextProps.text) {
        this.props.onChange(parse(nextProps.text));
      }
    },
  }),
)(({ text, changeText, isValid }) => (
  <div className="json-editor-container" data-comp="json-editor">
    <AutoSizer>
      {({ height, width }) => (
        <MonacoEditor
          height={height}
          width={width}
          language="json"
          value={text}
          options={{ scrollBeyondLastLine: false, readOnly: false }}
          requireConfig={requireConfig}
          onChange={newSource => changeText(newSource)}
        />
      )}
    </AutoSizer>
  </div>
));
