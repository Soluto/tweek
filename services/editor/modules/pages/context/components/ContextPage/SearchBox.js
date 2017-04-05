import React from 'react';
import { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import * as ContextService from "../../../../services/context-service";
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from "../../../../services/context-service";

export default compose(
  connect(state => state),
  withLoading(() => null, refreshSchema())
)
(class SearchBox extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

    if (!this.props.keys) {
      this.props.getKeys([]);
    }
  }

  render() {
    const identities = ContextService.getIdentities();
    return (
      <div>
        <select>{
          identities.map(identity => <option key={identity} value={ identity }>{ identity }</option>)
        }</select>

        <input type="text" placeholder="Value" />
        <button>Get</button>
      </div>
    );
  }
});
