import React, { Component } from 'react';
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

JPadTextEditor.propTypes = {
  source: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isReadonly: PropTypes.bool,
};

JPadTextEditor.defaultProps = {
  isReadonly: false,
};

export default JPadTextEditor;
