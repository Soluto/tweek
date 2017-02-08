import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {AutoSizer} from 'react-virtualized'
import style from './JPadTextEditor.css';

const requireConfig = {
  url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
  paths: {
    'vs': '/vs'
  }
};

export default class JPadTextEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentSource: props.source,
      allowSave: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentSource: nextProps.source,
      allowSave: false
    });
  }

  render() {
    let {currentSource} = this.state;
    return (
      <AutoSizer disableWidth={true}>
        {({height}) => (
          <div style={{height: height - 20}}>
            <MonacoEditor
              height={height - 20}
              language="json"
              value={currentSource}
              options={{scrollBeyondLastLine: false}}
              onChange={newSource => this._onChange(newSource)}
              requireConfig={requireConfig}
            />
            <button className={style['save-code-changes-button']} onClick={() => this._save()}
                    disabled={!this.state.allowSave}>
              Insert Changes
            </button>
          </div>
        )}
      </AutoSizer>
    )
  }

  _save() {
    let {onChange} = this.props;
    onChange(this.state.currentSource);
  }

  _onChange(newSource){
    let isValidJson = false;

    try {
      JSON.parse(newSource);
      isValidJson = true;
    }
    catch (e) {
      isValidJson = false;
    }

    this.setState({currentSource: newSource, allowSave: isValidJson})
  }
}