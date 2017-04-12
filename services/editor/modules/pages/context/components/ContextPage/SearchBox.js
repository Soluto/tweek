import React from 'react';
import { Component,PropTypes } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema,getIdentities } from "../../../../services/context-service";

import Button from '../Button/Button';
import TextInput from '../TextInput/TextInput';
import Select from '../Select/Select';

export default compose(
  connect(state => state),
  withLoading(() => null, refreshSchema())
)
(class SearchBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contextType: '',
      contextId: '',
      identities: []
    }
  }

  componentDidMount() {
    const identities = getIdentities();
    const contextType = identities[0];

    this.setState({ identities, contextType })
  }


  render() {
    const { contextType, identities } = this.state;

    return (
      <div style={ style.container }>

        <div style={ style.containerItem }>
          <p style={ style.containerItemLabel }>Context Type</p>
          <Select value={ contextType } options={ identities }
            onChange={ e => this.onContextTypeChange(e.target.value) } />
        </div>

        <div style={ style.containerItem }>
          <p style={ style.containerItemLabel }>Context Id</p>
          <TextInput
            placeholder={ 'Value' }
            onEnterKeyPress= { () => this.onGetClick() }
            onChange={ e => this.onContextIdChange(e.target.value) } />
        </div>

        <div style={ style.containerItem }>
          <Button style={{ alignSelf: 'flex-end' }} text={ 'Get' } onClick={ () => this.onGetClick() } />
        </div>
      </div>
    );
  }

  onContextTypeChange(contextType){
    this.setState({ contextType });
  }

  onContextIdChange(contextId){
    this.setState({ contextId });
  }

  onGetClick(){
    this.props.onGetContext({
      contextType: this.state.contextType,
      contextId: this.state.contextId
    })
  }
});

const style = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end'
  },

  containerItemLabel: {
    marginBottom: '4px'
  },

  containerItem: {
    padding: '10px'
  }
}

