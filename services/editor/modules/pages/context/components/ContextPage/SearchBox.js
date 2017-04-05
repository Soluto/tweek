import React from 'react';
import { Component,PropTypes } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema,getIdentities } from "../../../../services/context-service";

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

    return (
      <div>
        <select onChange={(e)=>this.setState({contextType: e.target.value})} value={ this.state.contextType }>{
          this.state.identities.map(identity => <option key={identity} value={ identity } >{ identity }</option>)
        }</select>

        <input type="text" placeholder="Value" onChange={(e)=>this.setState({contextId: e.target.value})} />
        <button onClick={ this.onGetClick.bind(this) }>Get</button>
      </div>
    );
  }

  onGetClick(){
    this.props.onGetContext({
      contextType: this.state.contextType,
      contextId: this.state.contextId
    })
  }
});

