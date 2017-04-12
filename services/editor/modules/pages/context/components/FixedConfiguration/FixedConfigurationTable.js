import React, { PropTypes, Component } from 'react';

import Button from '../Button/Button';
import InputText from '../TextInput/TextInput';

class FixedConfigurationTable extends Component {

  constructor(props){

    super(props)

    this.state = {
      configurations: props.fixedConfigurations,

      keyToAppend: '',
      valueToAppend: ''
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      configurations: nextProps.fixedConfigurations,
      keyToAppend: '',
      valueToAppend: ''
    })
  }

  render(){

    const { configurations } = this.state;

    return (
      <div style={ style.container }>{
        Object.keys(configurations).map(key => <div style={ style.row } key={ key }>
          <div style={ style.col }>{ key }</div>
          <div style={ style.col }>{ configurations[key] }</div>
        </div>)
      }
      
      <div style={ style.row }>
        <div style={ style.col }>
          <InputText placeholder="key"
            value={ this.state.keyToAppend }
            onChange={ e => this.onKeyToAppendChange(e.target.value) } />
        </div>
        <div style={ style.col }>
          <InputText placeholder="value"
            value={ this.state.valueToAppend }
            onEnterKeyPress={ () => this.appendConfiguration() }
            onChange={ e => this.onValueToAppendChange(e.target.value) } />
        </div>

        <div style={ style.col }>
          <Button text={'Add'} onClick={ () => this.appendConfiguration() } />
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Button onClick={ () => this.props.onSave(this.state.configurations) } text={ 'Save' } />
      </div>
      
      </div>
    )
  }

  onValueToAppendChange(valueToAppend){
    console.log({ valueToAppend })
    this.setState({ valueToAppend  });
  }

  onKeyToAppendChange(keyToAppend){
    console.log({ keyToAppend })
    this.setState({ keyToAppend })
  }

  appendConfiguration(){
    const newConfiguration = {
      ...this.state.configurations,
      [this.state.keyToAppend]: this.state.valueToAppend
    }

    this.setState({
      configurations: newConfiguration,
      keyToAppend: '',
      valueToAppend: ''
    })
  }
}

FixedConfigurationTable.propTypes = {
  fixedConfigurations: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired
}

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '600px'
  },

  row: {
    display: 'flex',
    flexDirection: 'row',

    marginTop: '10px'
  },

  col: {
    flex: 0.33,
    marginRight: '10px'
  }
}

export default FixedConfigurationTable;

