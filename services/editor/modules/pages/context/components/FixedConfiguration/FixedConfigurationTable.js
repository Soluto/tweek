import React, { PropTypes, Component } from 'react';

class FixedConfigurationTable extends Component {

  constructor(props){

    super(props)

    this.state = {
      configurations: props.fixedConfigurations,

      keyToAppend: '',
      valueToAppend: ''
    }
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
          <input type="text" placeholder="key"
            value={ this.state.keyToAppend }
            onChange={ e => this.setState({ keyToAppend: e.target.value }) } />
        </div>
        <div style={ style.col }>
          <input type="text" placeholder="value"
            value={ this.state.valueToAppend }
            onChange={ e => this.setState({ valueToAppend: e.target.value }) } />
        </div>

        <div style={ style.col }>
          <button onClick={ this.appendValue.bind(this) }>Add</button>
        </div>
        
      </div>

      <button onClick={ () => this.props.onSave(this.state.configurations) }>Save it</button>

      </div>
    )
  }

  appendValue(){
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
    flex: 0.33
  }
}

export default FixedConfigurationTable;

