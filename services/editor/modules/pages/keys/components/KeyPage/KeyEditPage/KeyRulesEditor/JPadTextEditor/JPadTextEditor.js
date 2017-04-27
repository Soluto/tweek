import React, { Component, PropTypes } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { AutoSizer } from 'react-virtualized';
import style from './JPadTextEditor.css';

const requireConfig = {
  url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
  paths: {
    vs: 'https://unpkg.com/monaco-editor@0.8.2/min/vs',
  },
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
    let isValidJson = false;

    try {
      JSON.parse(newSource);
      isValidJson = true;
    } catch (e) {
      isValidJson = false;
    }

    this.setState({ currentSource: newSource, allowSave: isValidJson });
  }

  save() {
    const { onChange } = this.props;
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
              height={height - 20}
              language="json"
              value={currentSource}
              options={{ scrollBeyondLastLine: false, readOnly: isReadonly }}
              onChange={newSource => this.onChange(newSource)}
              requireConfig={requireConfig}
            />
            <button
              className={style['save-code-changes-button']} onClick={() => this.save()}
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
