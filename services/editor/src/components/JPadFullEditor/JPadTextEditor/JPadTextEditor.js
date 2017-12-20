import React, { Component } from 'react';
import { compose, mapProps, withState, withHandlers } from 'recompose';
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

/*
class JPadTextEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSource: JSON.stringify(JSON.parse(props.source), null, 4),
      allowSave: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentSource: JSON.stringify(JSON.parse(nextProps.source), null, 4),
      allowSave: false,
    });
  }

  onChange(newSource) {
    try{
      parsedSource = JSON.parse(newSource);
    }
    catch (ex){

    }
    const { setHasChanges, source } = this.props;

    let isValidJson = false;
    let parsedSource;

    try {
      parsedSource = JSON.parse(newSource);
      isValidJson = true;
    } catch (e) {
      isValidJson = false;
    }

    const hasChanges = !isValidJson || !R.equals(source, parsedSource);

    setHasChanges(hasChanges);
    this.setState({ currentSource: newSource, allowSave: isValidJson && hasChanges });
  }

  save() {
    const { onChange, setHasChanges } = this.props;
    setHasChanges(false);
    onChange(this.state.currentSource);
  }

  render() {
    const { currentSource } = this.state;
    const { isReadonly } = this.props;

    return (
      <AutoSizer disableWidth>
        {({ height }) => (
          <div style={{ height: height - 20 }}>
            <MonacoEditor
              language="json"
              value={currentSource}
              options={{ ...monacoOptions, readOnly: isReadonly }}
              onChange={newSource => this.onChange(newSource)}
              requireConfig={requireConfig}
            />
            <button
              className="save-code-changes-button"
              data-comp="save-jpad-text"
              onClick={() => this.save()}
              disabled={!this.state.allowSave}
            >
              Insert Changes
            </button>
          </div>
        )}
      </AutoSizer>
    );
  }
}
*/

JPadTextEditor.propTypes = {
  source: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isReadonly: PropTypes.bool,
};

JPadTextEditor.defaultProps = {
  isReadonly: false,
};

export default JPadTextEditor;
