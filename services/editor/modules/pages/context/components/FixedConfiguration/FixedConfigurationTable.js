import React, { PropTypes, Component } from 'react';

import Button from '../Button/Button';
import InputText from '../TextInput/TextInput';

import getConfigurationDiff from './getConfigurationDiff';

import style from './fixed-configuration-table.css';

const classes = {
  container: style['context-fixed-configuration-table-container'],
  col: style['context-fixed-configuration-table-col'],
  row: style['context-fixed-configuration-table-row'],
  inputRow: style['context-fixed-configuration-table-input-row']
}

function renderConfigurationDiff(key, diff){

  if (key === undefined || key === ""){
    return null;
  }

  let keyComponent;
  let valueComponent;
  let operationComponent = <div className={ classes.col }><Button text="Delete" /></div>

  if (diff.isAdded){
    keyComponent = <div className={ classes.col } style={{ color: 'green' }}>{ key }</div>
    valueComponent = <div className={ classes.col } style={{ color: 'green' }}>{ diff.newValue }</div>
  } else if (diff.isUpdated) {
    keyComponent = <div className={ classes.col }>{ key }</div>
    valueComponent = <div className={ classes.col } style={{ color: 'green' }}>{ diff.newValue }<br />
      <small style={{ textDecoration: 'line-through',color: 'red' }}>{diff.initialValue}</small></div>
  } else if (diff.isRemoved) {
    keyComponent = <div className={ classes.col } style={{ textDecoration: 'line-through', color: 'red' }}>{ key }</div>
    valueComponent = <div className={ classes.col } style={{ textDecoration: 'line-through', color: 'red' }}>{ diff.initialValue }</div>
  } else {
    keyComponent = <div className={ classes.col }>{ key }</div>
    valueComponent = <div style={{display: 'flex', flexDirection: 'row'}} className={ classes.col }>
        <div style={{display: 'flex', flexDirection: 'col'}}>{ diff.newValue } </div>
      </div>
  }

  return <div key={ key } className={ classes.row }>
    { keyComponent }
    { valueComponent }
    { operationComponent }
  </div>
}
class FixedConfigurationTable extends Component {

  constructor(props){
    super(props)

    const newConfiguration = props.fixedConfigurations;
    const configurationDiff = getConfigurationDiff({ newConfiguration });

    this.state = {
      newConfiguration,
      configurationDiff,  
      keyToAppend: '',
      valueToAppend: ''
    }
  }

  componentWillReceiveProps(nextProps){

    const newConfiguration = nextProps.fixedConfigurations;

    this.setState({
      newConfiguration: newConfiguration,
      configurationDiff: getConfigurationDiff({ newConfiguration }),
      keyToAppend: '',
      valueToAppend: ''
    })
  }

  render(){

    const { configurationDiff } = this.state;

    return (
      <div className={ classes.container }>{
        Object.keys(configurationDiff).map(key => {
          return renderConfigurationDiff(key, configurationDiff[key])
        })
      }
      
      <div className={ classes.inputRow }>
        <div className={ classes.col }>
          <InputText placeholder="key"
            value={ this.state.keyToAppend }
            onChange={ e => this.onKeyToAppendChange(e.target.value) } />
        </div>
        <div className={ classes.col }>
          <InputText placeholder="value"
            value={ this.state.valueToAppend }
            onEnterKeyPress={ () => this.appendConfiguration() }
            onChange={ e => this.onValueToAppendChange(e.target.value) } />
        </div>

        <div className={ classes.col }>
          <Button text={'Add'} onClick={ () => this.appendConfiguration() } />
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Button onClick={ () => this.props.onSave(this.state.newConfiguration) } text={ 'Save' } />
      </div>
      
      </div>
    )
  }

  calculateConfigurationDiff(){
    this.setState({
      configurationDiff: getConfigurationDiff({
        newConfiguration: this.state.configurations,
        initialConfiguration: this.props.fixedConfigurations
      })
    })
  }

  onValueToAppendChange(valueToAppend){
    this.setState({ valueToAppend  });
  }

  onKeyToAppendChange(keyToAppend){
    this.setState({ keyToAppend })
  }

  appendConfiguration(){
    const newConfiguration = {
      ...this.state.newConfiguration,
      [this.state.keyToAppend]: this.state.valueToAppend
    }

    this.setState({
      newConfiguration,
      configurationDiff: getConfigurationDiff({
        newConfiguration,
        initialConfiguration: this.props.fixedConfigurations
      }),
      keyToAppend: '',
      valueToAppend: ''
    })
  }
}

FixedConfigurationTable.propTypes = {
  fixedConfigurations: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired
}

export default FixedConfigurationTable;

