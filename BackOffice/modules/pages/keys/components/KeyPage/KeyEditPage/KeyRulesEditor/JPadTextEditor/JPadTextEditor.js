import React from 'react';
import MonacoEditor from 'react-monaco-editor';
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
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      currentSource: nextProps.source,
      allowSave: false
    })
  }

  render() {
    let {currentSource} = this.state;
    return (
      <div>
        <button className={style['save-code-changes-button']} onClick={() => this._save()}
                disabled={!this.state.allowSave}>Insert Changes
        </button>

        <div className={style['editor']}>
          <MonacoEditor
            height="300"
            language="json"
            value={currentSource}
            onChange={newSource => this._onChange(newSource)}
            requireConfig={requireConfig}
          />
        </div>
      </div>
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